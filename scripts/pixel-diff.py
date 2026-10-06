#!/usr/bin/env python
"""pixel-diff.py — compara el render real contra el export de Figma.

La tercera pata del loop de fidelidad:
  1. `figma.mjs spec`    → qué dice el diseño (medidas, tipografías, colores)
  2. `measure.mjs`       → qué renderiza el navegador (DOM medido)
  3. `pixel-diff.py`     → cuánto se parecen los píxeles (verdad objetivo)

El PNG que exporta Figma suele venir con alfa (los frames no tienen fill
propio), así que se compone sobre el fondo del sitio antes de comparar.

Requiere Pillow (`pip install pillow`).

Uso:
  python scripts/pixel-diff.py design/live-1440.png \\
      "design/<fileKey>-<node>/preview@2x.png" \\
      [--bg=0a0f1a] [--tol=8] [--out=design/diff-1440.png] \\
      [--probe="1144,420;1000,300"]
"""
import argparse

from PIL import Image


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("live", help="captura del sitio (measure.mjs --png)")
    ap.add_argument("figma", help="export del nodo (figma.mjs export)")
    ap.add_argument("--bg", default="0a0f1a", help="fondo del sitio si el PNG de Figma tiene alfa")
    ap.add_argument("--tol", type=int, default=8, help="delta máximo para contar igual (0-255)")
    ap.add_argument("--out", help="ruta donde guardar la máscara de diferencias")
    ap.add_argument("--probe", default="", help='puntos "x,y;x,y" a imprimir en detalle')
    args = ap.parse_args()

    bg = hex_rgb(args.bg)
    live = Image.open(args.live).convert("RGB")
    figma = Image.open(args.figma)
    if figma.size != live.size:
        figma = figma.resize(live.size, Image.LANCZOS)
    figma = figma.convert("RGBA")
    base = Image.new("RGB", live.size, bg)
    base.paste(figma, (0, 0), figma)

    width, height = live.size
    lp, fp = live.load(), base.load()
    mask = Image.new("RGB", live.size) if args.out else None
    mp = mask.load() if mask else None

    equal, worst = 0, []
    for y in range(height):
        for x in range(width):
            delta = max(abs(fp[x, y][i] - lp[x, y][i]) for i in range(3))
            if delta <= args.tol:
                equal += 1
                color = (0, 0, 0)
            else:
                color = (255, 255, 255) if delta >= 255 else (min(255, delta * 3), 20, 20)
            if mp:
                mp[x, y] = color
            if delta > 60:
                worst.append((delta, x, y))

    print(f"{width}x{height} · coincidencia (delta<={args.tol}): {100 * equal / (width * height):.2f}%")
    for point in args.probe.split(";"):
        if point.strip():
            x, y = (int(v) for v in point.split(","))
            print(f"  ({x},{y})  figma {fp[x, y]}  live {lp[x, y]}")
    worst.sort(reverse=True)
    print("peores puntos (delta,x,y):", worst[:6])

    if mask:
        mask.save(args.out)
        print("máscara de diferencias ->", args.out)


if __name__ == "__main__":
    main()
