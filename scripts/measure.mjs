#!/usr/bin/env node
/**
 * measure.mjs — mide el DOM real del sitio (vía Chrome DevTools Protocol, sin
 * dependencias) y escribe un volcado en el MISMO formato que `figma.mjs spec`.
 *
 * Así el loop de fidelidad es: intención (Figma) vs realidad (navegador),
 * ambos como árbol indentado con geometría + tipografía + color, comparable
 * línea por línea.
 *
 * Uso:
 *   node scripts/measure.mjs --url=http://localhost:3000 --viewport=1440x912
 *   node scripts/measure.mjs --viewport=1920x912 --png --full
 *
 * Flags:
 *   --url=...            página a medir (por defecto http://localhost:3000/)
 *   --viewport=1440x912  tamaño del viewport CSS (por defecto 1440x912)
 *   --out=design         carpeta de salida (por defecto design)
 *   --name=live-1440     prefijo de los archivos (por defecto live-<W>x<H>)
 *   --depth=N            limita la profundidad del árbol
 *   --png                además captura una captura de pantalla
 *   --full               captura la página completa (si no, sólo el viewport)
 *   --instant            no espera a las animaciones de entrada: fuerza el
 *                        estado final de una (por defecto se espera a que
 *                        asienten, para no medir a mitad de animación)
 *   --chrome="C:/.../chrome.exe"
 *
 * Salida: <out>/<name>.md · <out>/<name>.json · <out>/<name>.png (con --png)
 */
import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/* --------------------------------------------------------------- argumentos */

const r2 = (v) => Math.round(v * 100) / 100;

function parseArgs(argv) {
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [k, v = "true"] = arg.slice(2).split("=");
      flags[k] = v;
    }
  }
  return flags;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

/* ------------------------------------------------------------- CDP client */

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const pending = new Map();
    const waiters = [];
    let seq = 0;

    ws.onerror = () => reject(new Error(`No pude conectar a ${url}`));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
        return;
      }
      if (!msg.method) return;
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].method === msg.method) {
          waiters[i].res(msg.params);
          waiters.splice(i, 1);
        }
      }
    };
    ws.onopen = () =>
      resolve({
        send(method, params) {
          const id = ++seq;
          return new Promise((res, rej) => {
            pending.set(id, { res, rej });
            ws.send(JSON.stringify({ id, method, params: params ?? {} }));
          });
        },
        once(method) {
          return new Promise((res) => waiters.push({ method, res }));
        },
        close: () => ws.close(),
      });
  });
}

async function waitForEndpoint(port, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* chrome todavía no escucha */
    }
    await sleep(250);
  }
  throw new Error("Chrome no expuso el endpoint de DevTools a tiempo");
}

/* ------------------------------------------------- volcado dentro del DOM */

// Se ejecuta en la página. Recorre todos los elementos y devuelve, por nodo:
// geometría (relativa al documento), layout efectivo (display/gap/padding),
// tipografía computada, color/fondo/borde/radio/sombra y su texto propio.
// El `path` es la ruta de índices desde <body>, para poder volver a ubicarlo.
const MEASURE = `(() => {
  const out = [];
  const cls = (el) => {
    const c = typeof el.className === "string" ? el.className : el.getAttribute("class") || "";
    return c.trim().split(/\\s+/).slice(0, 6).join(" ");
  };
  const walk = (el, path, depth) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    let own = "";
    for (const node of el.childNodes) if (node.nodeType === 3) own += node.nodeValue;
    out.push({
      path, depth,
      tag: el.tagName.toLowerCase(),
      cls: cls(el),
      x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height,
      display: cs.display,
      flow: cs.flexDirection,
      gap: cs.gap,
      padding: cs.padding,
      align: cs.alignItems + "/" + cs.justifyContent,
      radius: cs.borderRadius,
      border: cs.borderTopWidth + " " + cs.borderBottomWidth + " " + cs.borderLeftWidth + " "
        + cs.borderRightWidth + " " + cs.borderTopColor,
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage === "none" ? "" : cs.backgroundImage,
      color: cs.color,
      font: cs.fontFamily.split(",")[0].replace(/"/g, "") + " " + cs.fontWeight + " "
        + cs.fontSize + "/" + cs.lineHeight + " ls:" + cs.letterSpacing,
      shadow: cs.boxShadow === "none" ? "" : cs.boxShadow,
      opacity: cs.opacity,
      children: el.children.length,
      text: own.replace(/\\s+/g, " ").trim().slice(0, 100),
    });
    let i = 0;
    for (const child of el.children) walk(child, path + "." + i, depth + 1), i++;
  };
  walk(document.body, "0", 0);
  return JSON.stringify(out);
})()`;

// Espera a que terminen las animaciones de entrada (GSAP arranca en
// opacity:0 + translateY(24px)). Sin esto, medir a mitad del tween devuelve
// coordenadas corridas y la captura sale translúcida — falsos "diferencias".
const SETTLE = `(async () => {
  const t0 = Date.now();
  const ops = () => Array.from(document.querySelectorAll("[data-reveal]"));
  const done = (el) => {
    const cs = getComputedStyle(el);
    const t = cs.transform;
    const identity = t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
    return Math.abs(parseFloat(cs.opacity) - 1) < 0.01 && identity;
  };
  while (Date.now() - t0 < 6000) {
    const els = ops();
    if (els.length && els.every(done)) return "settled en " + (Date.now() - t0) + "ms";
    await new Promise((r) => requestAnimationFrame(r));
  }
  return "timeout (sigo con el estado actual)";
})()`;

// Fuerza el estado final sin esperar (para cuando no hay animaciones de entrada
// o están rotas). No siempre sobrevive a GSAP, de ahí el flag --instant.
const REVEAL_ON = `(() => {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("transform", "none", "important");
  });
  return "forced";
})()`;


const FONTS_READY = `document.fonts.ready.then(() => "fonts-ok")`;

/* --------------------------------------------------------------- formateo */

function fmt(e, maxDepth) {
  if (maxDepth != null && e.depth > maxDepth) return null;
  const bits = [`${"  ".repeat(e.depth)}${e.tag}${e.cls ? "." + e.cls.split(" ").join(".") : ""}`];
  bits.push(`${r2(e.w)}x${r2(e.h)} @ ${r2(e.x)},${r2(e.y)}`);
  bits.push(`[${e.path}]`);
  if (e.display.includes("flex") || e.display.includes("grid")) {
    bits.push(`${e.display} ${e.flow} gap ${e.gap} align ${e.align}`);
  } else {
    bits.push(e.display);
  }
  if (e.padding !== "0px") bits.push(`pad ${e.padding}`);
  const border = e.border.split(" ");
  if (border.slice(0, 4).some((w) => parseFloat(w) > 0)) bits.push(`border ${e.border}`);
  bits.push(`r ${e.radius}`);
  bits.push(e.font);
  bits.push(`color ${e.color}`);
  if (e.bg !== "rgba(0, 0, 0, 0)") bits.push(`bg ${e.bg}`);
  if (e.bgImage) bits.push(`bgImage ${e.bgImage}`);
  if (e.shadow) bits.push(`fx ${e.shadow}`);
  if (e.opacity !== "1") bits.push(`opacity ${e.opacity}`);
  if (e.text) bits.push(`text ${JSON.stringify(e.text)}`);
  return bits.join(" · ");
}

/* --------------------------------------------------------------------- main */

async function findChrome(explicit) {
  if (explicit) return explicit;
  for (const candidate of DEFAULT_CHROME) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* probar el siguiente */
    }
  }
  throw new Error('No encontré Chrome ni Edge. Pasá --chrome="ruta/al/ejecutable".');
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const url = flags.url ?? "http://localhost:3000/";
  const [vw, vh] = (flags.viewport ?? "1440x912").split("x").map(Number);
  const outDir = flags.out ?? "design";
  const name = flags.name ?? `live-${vw}x${vh}`;
  const maxDepth = flags.depth ? Number(flags.depth) : null;

  const chromePath = await findChrome(flags.chrome);
  const port = 9333 + Math.floor(Math.random() * 400);
  const profile = await mkdtemp(path.join(tmpdir(), "measure-"));

  const child = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--disable-extensions",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${vw},${vh}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await waitForEndpoint(port);
    const cdp = await connect(wsUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: vw,
      height: vh,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url });
    await loaded;
    await cdp.send("Runtime.evaluate", { expression: FONTS_READY, awaitPromise: true });
    await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });

    // El diseño se compara en su estado final: primero esperamos a que las
    // animaciones de entrada terminen; si no terminan, forzamos ese estado.
    let settleInfo = "forzado (--instant)";
    if (flags.instant !== "true") {
      const settle = await cdp.send("Runtime.evaluate", {
        expression: SETTLE,
        awaitPromise: true,
      });
      settleInfo = String(settle.result.value);
      if (settleInfo.startsWith("timeout")) {
        await cdp.send("Runtime.evaluate", { expression: REVEAL_ON });
      }
    } else {
      await cdp.send("Runtime.evaluate", { expression: REVEAL_ON });
    }
    await sleep(150);

    const measured = await cdp.send("Runtime.evaluate", {
      expression: MEASURE,
      returnByValue: true,
    });
    const items = JSON.parse(measured.result.value);
    const doc = await cdp.send("Runtime.evaluate", {
      expression:
        "JSON.stringify({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight})",
      returnByValue: true,
    });
    const size = JSON.parse(doc.result.value);

    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(items, null, 2));

    const lines = items.map((e) => fmt(e, maxDepth)).filter(Boolean);
    await writeFile(
      path.join(outDir, `${name}.md`),
      [
        `# Live spec — ${url}`,
        "",
        `- viewport ${vw}x${vh} · documento ${size.w}x${size.h}`,
        `- ${items.length} elementos · animaciones: ${settleInfo}`,
        `- medido ${new Date().toISOString()}`,
        "",
        "## Árbol (geometría relativa al documento)",
        "",
        "```",
        ...lines,
        "```",
        "",
      ].join("\n")
    );

    if (flags.png === "true") {
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: flags.full === "true",
      });
      await writeFile(path.join(outDir, `${name}.png`), Buffer.from(shot.data, "base64"));
      console.log(`PNG -> ${path.join(outDir, `${name}.png`)}`);
    }

    cdp.close();
    console.log(`${name}.md + ${name}.json -> ${outDir}`);
    console.log(`elementos ${items.length} · documento ${size.w}x${size.h} · animaciones ${settleInfo}`);
  } finally {
    child.kill();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("[measure] fallo:", err.stack ?? err.message);
  process.exit(1);
});
