#!/usr/bin/env node
/**
 * fetch-assets.mjs — baja los assets que Figma Dev Mode sirve en
 * http://localhost:3845/assets/<hash>.{svg,png}
 *
 * Las URLs ya vienen dentro de las capturas de `get_design_context`
 * (design/ctx/*.txt), así que el script las lee de ahí y guarda cada archivo en
 * design/assets/ con el nombre del nodo como comentario en un índice.
 *
 *   node.exe scripts/fetch-assets.mjs            # todos los design/ctx/*.txt
 *   node.exe scripts/fetch-assets.mjs plan-dt    # sólo las capturas que contengan "plan-dt"
 *
 * Requiere Figma Desktop abierto con el archivo de diseño activo (el server de
 * assets vive dentro de la app).
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctxDir = join(root, "design", "ctx");
const outDir = join(root, "design", "assets");

const filters = process.argv.slice(2);
const files = (await readdir(ctxDir)).filter(
  (f) => f.endsWith(".txt") && (filters.length === 0 || filters.some((s) => f.includes(s)))
);

const wanted = new Map(); // hash+ext -> { url, sources: Set<string> }
for (const file of files) {
  const text = await readFile(join(ctxDir, file), "utf8");
  for (const m of text.matchAll(/http:\/\/localhost:3845\/assets\/([0-9a-f]+\.(?:svg|png))/g)) {
    const asset = m[1];
    if (!wanted.has(asset)) wanted.set(asset, { asset, sources: new Set() });
    wanted.get(asset).sources.add(file);
  }
}

if (wanted.size === 0) {
  console.log("No se encontraron referencias a localhost:3845/assets en", ctxDir);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const index = [];
for (const { asset, sources } of wanted.values()) {
  const res = await fetch(`http://localhost:3845/assets/${asset}`);
  if (!res.ok) {
    console.log(`✗ ${asset} · HTTP ${res.status}`);
    continue;
  }
  const body = Buffer.from(await res.arrayBuffer());
  await writeFile(join(outDir, asset), body);
  console.log(`✓ ${asset} · ${body.length}B · ${[...sources].join(", ")}`);
  index.push(`${asset}\t${[...sources].join(",")}`);
}

await writeFile(join(outDir, "index.txt"), index.join("\n") + "\n");
console.log(`\n${index.length} assets en design/assets/ · índice: design/assets/index.txt`);
