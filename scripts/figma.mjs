#!/usr/bin/env node
/**
 * figma.mjs — extrae una spec *fiel* de un nodo de Figma para reconstruirlo 1:1.
 *
 * En vez de mirar capturas, este script vuelca la verdad del archivo:
 * geometría exacta relativa al frame, auto-layout (gap / padding / align /
 * sizing FILL-HUG-FIXED), tipografía completa, `characters` escapados,
 * fills y strokes (incluidos gradientes con handles y matriz), radios,
 * sombras / blur, opacidad, clip, constraints, posicionamiento absoluto
 * y máscaras.
 *
 * Uso:
 *   node scripts/figma.mjs spec   "<figma-url|fileKey>" [nodeId] [flags]
 *   node scripts/figma.mjs export "<figma-url|fileKey>" <nodeId> [flags]
 *   node scripts/figma.mjs assets "<figma-url|fileKey>" <nodeId> [flags]
 *   node scripts/figma.mjs all    "<figma-url|fileKey>" <nodeId> [flags]
 *
 * Token (scope `file_read`), por orden de precedencia:
 *   --token=figd_...   |   process.env.FIGMA_TOKEN   |   ./.figma-token
 *
 * Flags:
 *   --out=design        carpeta de salida (por defecto: design)
 *   --geo               pide `geometry=paths` (incluye trazados vectoriales)
 *   --depth=N           limita la profundidad del árbol
 *   --scale=2           escala del PNG (por defecto 2)
 *
 * Salida en <out>/<fileKey>-<nodeId>/:
 *   spec.md · spec.json · preview@<scale>x.png · preview.svg · assets/*
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://api.figma.com/v1";

/* ------------------------------------------------------------------ utils */

const n = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);

function hex(c = {}) {
  const to = (x) => Math.round((x ?? 1) * 255).toString(16).padStart(2, "0");
  const base = `#${to(c.r)}${to(c.g)}${to(c.b)}`;
  return (c.a ?? 1) >= 1 ? base : `${base} a${n(c.a)}`;
}

/**
 * A FIGMA paint carries opacity in *two* places and multiplies them: the alpha
 * baked into the colour (`color.a`) and `paint.opacity` (the layer's own A
 * field). Reading only `color.a` silently loses the second one — which is how
 * the "Órbita" rings (stroke #9BC5FF @ 14%) came out at 100% opacity.
 */
const withPaintOpacity = (c, opacity) => ({
  ...c,
  a: (c?.a ?? 1) * (opacity ?? 1),
});

function gradStr(g) {
  const stops = (g.gradientStops ?? [])
    .map((s) => `${hex(withPaintOpacity(s.color, g.opacity))} ${n(s.position * 100)}%`)
    .join(" -> ");
  const handles = (g.gradientHandlePositions ?? [])
    .map((p) => `(${n(p.x)},${n(p.y)})`)
    .join(" ");
  const matrix = g.gradientTransform
    ? ` matrix [${g.gradientTransform.flat().map(n).join(" ")}]`
    : "";
  return `${g.type} handles ${handles}${matrix} stops ${stops}`;
}

function paintStr(p) {
  if (!p) return null;
  if (p.visible === false) return "hidden";
  if (p.type === "SOLID") return hex(withPaintOpacity(p.color, p.opacity));
  if (typeof p.type === "string" && p.type.startsWith("GRADIENT")) return gradStr(p);
  if (p.type === "IMAGE") {
    const crop = p.imageTransform
      ? ` crop [${p.imageTransform.flat().map(n).join(" ")}]`
      : "";
    const alpha = p.opacity != null && p.opacity !== 1 ? ` a${n(p.opacity)}` : "";
    return `IMAGE ${p.imageRef} mode=${p.scaleMode ?? "FILL"}${crop}${alpha}`;
  }
  return p.type;
}

function fxStr(effect) {
  const hidden = effect.visible === false ? " hidden" : "";
  if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
    const o = effect.offset ?? { x: 0, y: 0 };
    const kind = effect.type === "DROP_SHADOW" ? "shadow" : "inner-shadow";
    return `${kind} ${n(o.x)}px ${n(o.y)}px blur ${n(effect.radius)} spread ${n(
      effect.spread ?? 0
    )} ${hex(effect.color)}${hidden}`;
  }
  return `${effect.type} ${n(effect.radius)}px${hidden}`;
}

function strokeStr(node) {
  const strokes = (node.strokes ?? []).filter((s) => s.visible !== false);
  if (!strokes.length) return null;
  const w = node.individualStrokeWeights
    ? `t${n(node.individualStrokeWeights.top)} r${n(
        node.individualStrokeWeights.right
      )} b${n(node.individualStrokeWeights.bottom)} l${n(
        node.individualStrokeWeights.left
      )}`
    : `${n(node.strokeWeight ?? 1)}px`;
  const dashes = node.strokeDashes?.length ? ` dashes ${node.strokeDashes}` : "";
  return `${w} ${strokes.map(paintStr).join(" + ")} ${node.strokeAlign ?? "INSIDE"}${dashes}`;
}

function layoutStr(node) {
  const bits = [];
  if (node.layoutMode && node.layoutMode !== "NONE") {
    bits.push(
      `[${node.layoutMode.toLowerCase()}${node.layoutWrap === "WRAP" ? " wrap" : ""}]`
    );
    bits.push(
      `gap ${n(node.itemSpacing ?? 0)}${
        node.layoutWrap === "WRAP" ? `/${n(node.counterAxisSpacing ?? 0)}` : ""
      }`
    );
    bits.push(
      `pad ${n(node.paddingTop ?? 0)} ${n(node.paddingRight ?? 0)} ${n(
        node.paddingBottom ?? 0
      )} ${n(node.paddingLeft ?? 0)}`
    );
    bits.push(
      `align ${node.primaryAxisAlignItems ?? "MIN"}/${node.counterAxisAlignItems ?? "MIN"}`
    );
  }
  const sizing = [];
  if (node.layoutSizingHorizontal) sizing.push(`w:${node.layoutSizingHorizontal}`);
  if (node.layoutSizingVertical) sizing.push(`h:${node.layoutSizingVertical}`);
  if (node.layoutGrow === 1) sizing.push("grow:1");
  if (node.layoutAlign === "STRETCH") sizing.push("align:stretch");
  if (sizing.length) bits.push(sizing.join(" "));
  if (node.layoutPositioning === "ABSOLUTE") bits.push("POSITION:ABSOLUTE");
  else if (node.constraints)
    bits.push(`constraints ${node.constraints.horizontal}/${node.constraints.vertical}`);
  return bits;
}

/**
 * Estilos por rango de caracteres: Figma guarda `characterStyleOverrides`
 * (un styleID por carácter) + `styleOverrideTable`. Sin esto, un color de una
 * sola palabra (como "convertir." en azul) es invisible: el fill del nodo
 * reporta el color base de todo el texto.
 */
function overridesStr(node) {
  const cso = node.characterStyleOverrides;
  const table = node.styleOverrideTable;
  if (!cso?.length || !table) return null;

  const ranges = [];
  cso.forEach((sid, i) => {
    if (!sid) return;
    const last = ranges[ranges.length - 1];
    if (last && last.sid === sid && last.end === i) last.end = i + 1;
    else ranges.push({ sid, start: i, end: i + 1 });
  });
  if (!ranges.length) return null;

  const chars = node.characters ?? "";
  return ranges
    .map(({ sid, start, end }) => {
      const style = table[sid] ?? {};
      const fills = (style.fills ?? [])
        .filter((f) => f.visible !== false)
        .map(paintStr)
        .join(" + ");
      const font = style.fontFamily ? `${style.fontFamily} ${style.fontWeight ?? ""}` : null;
      return `${JSON.stringify(chars.slice(start, end))} [${start}..${end})${fills ? ` fill ${fills}` : ""}${font ? ` font ${font}` : ""}`;
    })
    .join(" + ");
}

function textStr(node) {
  const s = node.style ?? {};
  const ls =
    s.letterSpacing == null
      ? "0"
      : `${n(s.letterSpacing)}${s.letterSpacingUnit === "PERCENT" ? "%" : "px"}`;
  const lh =
    s.lineHeightPx == null
      ? "auto"
      : `${n(s.lineHeightPx)}px(${s.lineHeightUnit}${
          s.lineHeightUnit === "PERCENT" ? ` ${n(s.lineHeightPercentFontSize)}%` : ""
        })`;
  return [
    `text ${JSON.stringify(node.characters ?? "")}`,
    `${s.fontFamily} ${s.fontWeight ?? ""}${
      s.fontPostScriptName ? ` <${s.fontPostScriptName}>` : ""
    }`,
    `${n(s.fontSize)}px/${lh}`,
    `ls:${ls}`,
    `align ${s.textAlignHorizontal ?? "LEFT"}/${s.textAlignVertical ?? "TOP"}`,
    `autosize:${s.textAutoResize ?? node.textAutoResize ?? "?"}`,
    s.textCase && s.textCase !== "ORIGINAL" ? `case:${s.textCase}` : null,
    s.textDecoration && s.textDecoration !== "NONE" ? `deco:${s.textDecoration}` : null,
    overridesStr(node) ? `spans ${overridesStr(node)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function lineFor(node, rel, depth) {
  const bits = [`${"  ".repeat(depth)}${node.type} ${JSON.stringify(node.name)}`];
  if (rel) bits.push(`${n(rel.w)}x${n(rel.h)} @ ${n(rel.x)},${n(rel.y)}`);
  bits.push(...layoutStr(node));

  const fills = (node.fills ?? []).filter((f) => f.visible !== false).map(paintStr);
  if (fills.length) bits.push(`fill ${fills.join(" + ")}`);
  const stroke = strokeStr(node);
  if (stroke) bits.push(`stroke ${stroke}`);

  let radii = null;
  if (node.rectangleCornerRadii) radii = `r ${node.rectangleCornerRadii.map(n).join("/")}`;
  else if (node.cornerRadius != null) radii = `r ${n(node.cornerRadius)}`;
  if (radii) bits.push(radii);

  if (node.effects?.length) bits.push(`fx ${node.effects.map(fxStr).join(" + ")}`);
  if (node.opacity != null && node.opacity !== 1) bits.push(`opacity ${n(node.opacity)}`);
  if (node.blendMode && node.blendMode !== "PASS_THROUGH") bits.push(node.blendMode);
  if (node.clipsContent) bits.push("clip");
  if (node.isMask) bits.push("MASK");
  if (node.rotation) bits.push(`rotate ${n(node.rotation)}deg`);
  if (node.type === "TEXT") bits.push(textStr(node));

  return bits.join(" · ");
}

function walk(node, origin, depth, out, maxDepth) {
  const bb = node.absoluteBoundingBox ?? node.absoluteRenderBounds;
  // `origin` es el bbox del nodo raíz: todas las coordenadas quedan relativas
  // al frame, que es como se leen al maquetar (0,0 = esquina del frame).
  const rel =
    bb && origin
      ? { x: bb.x - origin.x, y: bb.y - origin.y, w: bb.width, h: bb.height }
      : null;
  out.push(`#${node.id} ${lineFor(node, rel, depth)}`);
  if (maxDepth != null && depth >= maxDepth) return out;
  for (const child of node.children ?? []) walk(child, origin, depth + 1, out, maxDepth);
  return out;
}

function collect(node, acc) {
  if (node.type === "TEXT") {
    const s = node.style ?? {};
    acc.fonts.push(
      `${s.fontFamily} / ${s.fontWeight}${
        s.fontPostScriptName ? ` (${s.fontPostScriptName})` : ""
      }`
    );
    acc.sizes.push(`${n(s.fontSize)}px/${n(s.lineHeightPx)}`);
  }
  for (const p of [...(node.fills ?? []), ...(node.strokes ?? [])]) {
    if (p.visible === false) continue;
    if (p.type === "SOLID") acc.colors.push(`${hex(p.color)}  (${node.id})`);
    if (p.type === "IMAGE" && p.imageRef) acc.images.add(p.imageRef);
    if (typeof p.type === "string" && p.type.startsWith("GRADIENT"))
      acc.gradients.push(`${p.type}  (${node.id})`);
  }
  if (node.effects?.length)
    acc.effects.push(`${node.id} ${node.effects.map(fxStr).join(" + ")}`);
  if (["ELLIPSE", "VECTOR", "LINE", "BOOLEAN_OPERATION", "STAR", "POLYGON"].includes(node.type))
    acc.vectors.push(`${node.id} ${node.type} ${JSON.stringify(node.name)}`);
  for (const child of node.children ?? []) collect(child, acc);
  return acc;
}

const uniq = (arr) => [...new Set(arr)];

/* -------------------------------------------------------------- figma api */

async function figma(pathname, params, token) {
  const url = new URL(API + pathname);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v != null) url.searchParams.set(k, String(v));
  }
  if (process.env.FIGMA_DEBUG) {
    console.error("[debug]", url.href, "token:", JSON.stringify(token));
  }
  const res = await fetch(url, { headers: { "X-Figma-Token": token } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma ${res.status} ${res.statusText} en ${url.pathname}\n${body}`);
  }
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url} (${res.status})`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

/* --------------------------------------------------------------- argumentos */

function parseTarget(input, nodeArg) {
  let key = input;
  let nodeId = nodeArg;
  const m = input.match(/figma\.com\/(?:design|file|board|proto)\/([A-Za-z0-9]+)/);
  if (m) {
    key = m[1];
    const q = input.match(/node-id=([0-9]+(?:[-:][0-9]+)?)/);
    if (q) nodeId = q[1];
  }
  if (nodeId) nodeId = nodeId.replace("-", ":");
  return { key, nodeId };
}

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [k, v = "true"] = arg.slice(2).split("=");
      flags[k] = v;
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

async function readToken(flags) {
  if (flags.token) return flags.token;
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  try {
    return (await readFile(".figma-token", "utf8")).trim();
  } catch {
    throw new Error(
      "Falta el token: usá FIGMA_TOKEN=... , un archivo .figma-token o --token=figd_..."
    );
  }
}

async function loadNode(key, nodeId, token, geo) {
  const json = await figma(
    `/files/${key}/nodes`,
    { ids: nodeId, geometry: geo ? "paths" : null },
    token
  );
  const entry = json.nodes?.[nodeId];
  if (!entry) throw new Error(`El nodo ${nodeId} no existe en el archivo ${key}`);
  return entry.document;
}

/**
 * El frame puede no tener fill propio: en ese caso el color que se ve detrás
 * sale del canvas de la página de Figma. Sin este dato, el fondo del hero se
 * elige a ojo (y suele quedar distinto al diseño).
 */
async function loadPage(key, nodeId, token) {
  const file = await figma(`/files/${key}`, { depth: 2 }, token);
  const pages = file.document?.children ?? [];
  const page =
    pages.find((p) => (p.children ?? []).some((c) => c.id === nodeId)) ?? pages[0];
  if (!page) return null;
  return { name: page.name, background: hex(page.backgroundColor ?? {}) };
}

const EMPTY_ACC = () => ({
  fonts: [],
  sizes: [],
  colors: [],
  gradients: [],
  effects: [],
  vectors: [],
  images: new Set(),
});

/* ----------------------------------------------------------------- comandos */

async function cmdSpec(key, nodeId, token, flags, outDir) {
  const root = await loadNode(key, nodeId, token, flags.geo === "true");
  const maxDepth = flags.depth ? Number(flags.depth) : null;
  const origin = root.absoluteBoundingBox ?? root.absoluteRenderBounds;
  const tree = walk(root, origin, 0, [], maxDepth);
  const acc = collect(root, EMPTY_ACC());
  const bb = root.absoluteBoundingBox ?? root.absoluteRenderBounds;
  const page = flags.page === "false" ? null : await loadPage(key, nodeId, token);

  const specs = {
    file: key,
    node: nodeId,
    name: root.name,
    type: root.type,
    page,
    size: bb ? `${n(bb.width)}x${n(bb.height)}` : null,
    exportedAt: new Date().toISOString(),
    nodeCount: tree.length,
    fonts: uniq(acc.fonts),
    fontSizes: uniq(acc.sizes),
    colors: uniq(acc.colors),
    gradients: uniq(acc.gradients),
    effects: uniq(acc.effects),
    vectors: uniq(acc.vectors),
    imageRefs: [...acc.images],
    tree,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "spec.json"), JSON.stringify(specs, null, 2));

  const list = (items) => (items.length ? items.map((i) => `- ${i}`) : ["- (ninguno)"]);
  const md = [
    `# Figma spec — ${root.name}`,
    "",
    `- file \`${key}\` · node \`${nodeId}\` · tipo ${root.type}`,
    `- tamaño ${specs.size} (unidades de diseño, bbox absoluto del nodo raíz)`,
    page
      ? `- página \`${page.name}\` · canvas ${page.background} (si el frame no tiene fill propio, este es el fondo que se ve)`
      : null,
    `- ${specs.nodeCount} nodos · exportado ${specs.exportedAt}`,
    "",
    "## Árbol (geometría relativa al nodo raíz)",
    "",
    "```",
    ...tree,
    "```",
    "",
    "## Fuentes",
    ...list(specs.fonts),
    "",
    "## Tamaños de texto (font-size/line-height)",
    ...list(specs.fontSizes),
    "",
    "## Colores sólidos usados como fill o stroke",
    ...list(specs.colors),
    "",
    "## Gradientes",
    ...list(specs.gradients),
    "",
    "## Efectos",
    ...list(specs.effects),
    "",
    "## Vectores y máscaras",
    ...list(specs.vectors),
    "",
    "## Image fills (correr `assets` para descargarlas)",
    ...list(specs.imageRefs),
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");
  await writeFile(path.join(outDir, "spec.md"), md);

  console.log(`spec.md + spec.json -> ${outDir}`);
  console.log(
    `nodos ${specs.nodeCount} · fuentes ${specs.fonts.length} · colores ${specs.colors.length}`
  );
  return specs;
}

async function cmdExport(key, nodeId, token, flags, outDir) {
  const scale = flags.scale ?? "2";
  await mkdir(outDir, { recursive: true });

  const png = await figma(`/images/${key}`, { ids: nodeId, format: "png", scale }, token);
  const pngUrl = png.images?.[nodeId];
  if (pngUrl) {
    const dest = path.join(outDir, `preview@${scale}x.png`);
    await download(pngUrl, dest);
    console.log(`PNG -> ${dest}`);
  }

  // svg_include_id pone `id="4:14139"` en cada elemento del SVG: permite
  // mapear cada pieza del render de vuelta al nodo de Figma que la produjo.
  // svg_outline_text=false conserva el texto real (revisable / diffeable).
  const svg = await figma(
    `/images/${key}`,
    {
      ids: nodeId,
      format: "svg",
      svg_include_id: "true",
      svg_outline_text: "false",
      svg_simplify_stroke: "false",
    },
    token
  );
  const svgUrl = svg.images?.[nodeId];
  if (svgUrl) {
    const dest = path.join(outDir, "preview.svg");
    await download(svgUrl, dest);
    console.log(`SVG -> ${dest}`);
  }
}

async function cmdAssets(key, nodeId, token, outDir) {
  const root = await loadNode(key, nodeId, token, false);
  const refs = [...collect(root, EMPTY_ACC()).images];
  if (!refs.length) {
    console.log("Sin image fills en este nodo.");
    return;
  }
  const dest = path.join(outDir, "assets");
  await mkdir(dest, { recursive: true });
  const resolved = await figma(
    `/images/${key}`,
    { ids: refs.join(","), format: "png", scale: 2 },
    token
  );
  for (const ref of refs) {
    const url = resolved.images?.[ref];
    if (!url) {
      console.log(`imageRef ${ref} sin URL (¿permisos o scope?)`);
      continue;
    }
    const file = path.join(dest, `img-${ref}.png`);
    await download(url, file);
    console.log(`asset -> ${file}`);
  }
}

/* --------------------------------------------------------------------- cli */

const USAGE =
  'Uso: node scripts/figma.mjs <spec|export|assets|all> "<figma-url|fileKey>" <nodeId> ' +
  "[--out=design] [--geo] [--depth=N] [--scale=2] [--token=figd_...]";

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [cmd, target, nodeArg] = positional;

  if (!cmd || !target) {
    console.error(USAGE);
    process.exit(1);
  }
  if (!["spec", "export", "assets", "all"].includes(cmd)) {
    console.error(USAGE);
    process.exit(1);
  }

  const token = await readToken(flags);
  const { key, nodeId } = parseTarget(target, nodeArg);
  if (!key || !nodeId) {
    console.error(`No pude determinar fileKey y nodeId desde "${target}".\n${USAGE}`);
    process.exit(1);
  }

  // Mismo folder por fileKey+nodeId: spec, previews y assets quedan juntos.
  const outDir = path.join(flags.out ?? "design", `${key}-${nodeId.replace(":", "-")}`);

  if (cmd === "spec" || cmd === "all") await cmdSpec(key, nodeId, token, flags, outDir);
  if (cmd === "export" || cmd === "all") await cmdExport(key, nodeId, token, flags, outDir);
  if (cmd === "assets" || cmd === "all") await cmdAssets(key, nodeId, token, outDir);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
