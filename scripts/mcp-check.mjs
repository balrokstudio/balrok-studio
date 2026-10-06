#!/usr/bin/env node
/**
 * Diagnóstico del Figma Dev Mode MCP Server (http://127.0.0.1:3845/mcp).
 *
 * Hace el handshake REAL del protocolo Streamable HTTP (initialize → initialized
 * → tools/list) y dice exactamente en qué paso falla y por qué.
 *
 *   node scripts/mcp-check.mjs
 *   node scripts/mcp-check.mjs --url=http://127.0.0.1:3845/mcp
 *
 * Y para invocar una herramienta del server sin pasar por el IDE:
 *
 *   node scripts/mcp-check.mjs --call=get_metadata --args='{"nodeId":"4:14123"}'
 *   node scripts/mcp-check.mjs --call=get_design_context \
 *     --args='{"nodeId":"4:14123","fileKey":"8MLojKHAFEE3rGYwgROC4h"}'
 *
 * Nota: este endpoint NO usa Personal Access Token. Se autentica con la sesión
 * de la app Figma Desktop. El PAT (`.figma-token`) es sólo para la API REST que
 * usa scripts/figma.mjs.
 *
 * No usa process.exit() a propósito: en Windows, salir con sockets keep-alive
 * pendientes rompe libuv ("Assertion failed: async.c"). Se fija process.exitCode
 * y se deja drenar el event loop.
 */

import { writeFileSync } from 'node:fs';

const url = (process.argv.find((a) => a.startsWith('--url=')) ?? '').slice(6) || 'http://127.0.0.1:3845/mcp';


const HDRS = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
const post = (body, extra = {}) =>
  fetch(url, { method: 'POST', headers: { ...HDRS, ...extra }, body: JSON.stringify(body) });

// El server responde `text/event-stream`: el JSON puede venir plano o dentro de `data:`.
async function parse(res) {
  const text = await res.text();
  const data = text
    .split('\n')
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim());
  try {
    return JSON.parse(data.length ? data.join('') : text);
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

class Fail extends Error {}

async function main() {
  console.log(`\nFigma Dev Mode MCP Server — diagnóstico\n  url ${url}\n`);

  // 1 · initialize — acá el server entrega el Mcp-Session-Id.
  let res;
  try {
    res = await post({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mcp-check', version: '1.0' },
      },
    });
  } catch (err) {
    throw new Fail(
      `no se pudo conectar: ${err.message}\n` +
        `     Causas: Figma Desktop cerrado, el toggle "Dev Mode MCP Server" apagado,\n` +
        `     o el puerto 3845 ocupado por otro proceso.`,
    );
  }

  if (!res.ok) {
    throw new Fail(`initialize → HTTP ${res.status}. Respuesta: ${JSON.stringify(await parse(res)).slice(0, 200)}`);
  }

  const sid = res.headers.get('mcp-session-id');
  const init = await parse(res);
  if (!sid) throw new Fail(`initialize no devolvió Mcp-Session-Id: ${JSON.stringify(init).slice(0, 200)}`);

  console.log(`  ✓ initialize                HTTP ${res.status} · session ${sid}`);
  const si = init.result?.serverInfo;
  if (si) console.log(`      ${`${si.name ?? ''} ${si.version ?? ''}`.trim()}`);

  // 2 · initialized — notificación obligatoria antes de cualquier otra request.
  const notif = await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, { 'mcp-session-id': sid });
  console.log(`  ${notif.ok ? '✓' : '✗'} notifications/initialized  HTTP ${notif.status}`);

  // 3 · tools/list — acá Figma exige que la pestaña activa sea un archivo.
  const tres = await post({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, { 'mcp-session-id': sid });
  const tools = await parse(tres);

  if (tools.error) {
    console.error(`  ✗ tools/list                ${tools.error.code} · ${tools.error.message}\n`);
    console.error('  → En Figma Desktop la PESTAÑA ACTIVA debe ser un archivo de diseño');
    console.error('    (o FigJam), no la pantalla de inicio ni la comunidad. Volvé a correrlo.\n');
    process.exitCode = 1;
    return;
  }

  const list = tools.result?.tools ?? [];
  console.log(`  ✓ tools/list                HTTP ${tres.status} · ${list.length} herramientas`);
  for (const t of list) {
    const first = (t.description ?? '').split('\n')[0];
    console.log(`      · ${t.name}${first ? ` — ${first}` : ''}`);
  }
  if (process.env.MCP_CHECK_DUMP_ALL) console.log(`\n${JSON.stringify(list, null, 2)}`);

  // 4 · tools/call — opcional, para invocar una herramienta sin el IDE.
  const callArg = process.argv.find((a) => a.startsWith('--call='));
  if (callArg) {
    const name = callArg.slice(7);
    const argsArg = process.argv.find((a) => a.startsWith('--args='));
    let toolArgs = {};
    if (argsArg) {
      try {
        toolArgs = JSON.parse(argsArg.slice(7));
      } catch (err) {
        throw new Fail(`--args no es JSON válido: ${err.message}`);
      }
    }

    const cres = await post(
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name, arguments: toolArgs } },
      { 'mcp-session-id': sid },
    );
    const out = await parse(cres);
    console.log(`\n  tools/call → ${name}  HTTP ${cres.status}`);

    if (out.error) {
      console.error(`  ✗ tools/call                ${out.error.code} · ${out.error.message}`);
      process.exitCode = 1;
      return;
    }

    const parts = out.result?.content ?? [];
    console.log(`  ${out.result?.isError ? '✗' : '✓'} ${parts.length} bloque(s) de contenido\n`);

    // --save-img=<ruta>: los bloques `image` llegan como base64 dentro del JSON-RPC
    // y sin esto sólo se imprimía "[image · image/png]" — el PNG se perdía.
    // Con varios bloques, el sufijo -1/-2 se agrega antes de la extensión.
    const imgArg = process.argv.find((a) => a.startsWith('--save-img='));
    if (imgArg) {
      const base = imgArg.slice('--save-img='.length);
      const imgs = parts.filter((p) => p.type === 'image' && p.data);
      if (!imgs.length) console.error(`  ⚠ --save-img: la respuesta no trae bloques image`);
      imgs.forEach((p, i) => {
        const ext = p.mimeType?.includes('jpeg') ? '.jpg' : p.mimeType?.includes('webp') ? '.webp' : '.png';
        const file = imgs.length === 1 ? base : `${base.replace(/\.[a-z]+$/i, '')}-${i + 1}${ext}`;
        const buf = Buffer.from(p.data, 'base64');
        writeFileSync(file, buf);
        console.log(`  ⤓ guardado ${file} · ${Math.round(buf.length / 1024)} KB · ${p.mimeType ?? 'image/png'}`);
      });
    }

    for (const p of parts) {
      if (p.type === 'text') console.log(p.text);
      else console.log(`  [${p.type}${p.mimeType ? ` · ${p.mimeType}` : ''}]`);
    }
    if (!parts.length) console.log(JSON.stringify(out.result, null, 2).slice(0, 4000));
    return;
  }

  console.log('\n  Handshake y tools OK. Si el IDE igual da "Invalid sessionId", tiene una\n' +
    '  sesión cacheada muerta: toggle del server en el IDE (o apagar/encender el\n' +
    '  toggle en Figma) y reconectar. No alcanza con reintentar.\n');
}

try {
  await main();
} catch (err) {
  if (err instanceof Fail) {
    console.error(`\n  ✗ ${err.message}\n`);
    process.exitCode = 1;
  } else {
    throw err;
  }
}
