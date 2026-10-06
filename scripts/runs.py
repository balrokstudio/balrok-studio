#!/usr/bin/env python
"""runs.py — recorridos de color a lo largo de una línea de una imagen.

Mide la verdad del render de Figma (o del navegador) en px exactos: dónde empieza
y termina cada banda de color sobre una columna o una fila. Es lo que permite
decir "la tarjeta mide 503 y el separador arranca en y=154" sin leer un overlay
a ojo.

    python scripts/runs.py design/measure/fig-plancard-dt.png --axis=y --at=336 \\
        --colors=0d1e3a,294467,2463ff,142c50,ffffff

`--axis=y` recorre la columna x=at; `--axis=x` recorre la fila y=at. Imprime una
banda por tramo contiguo de color (tolerancia `--tol`, por defecto 16) con su
inicio, fin, alto y el nombre (`--colors` o hex) más cercano.
"""

import argparse
from PIL import Image


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip().lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("png")
    ap.add_argument("--axis", choices=["x", "y"], default="y")
    ap.add_argument("--at", type=int, required=True, help="columna (axis=y) o fila (axis=x)")
    ap.add_argument("--colors", default="", help="hex separados por coma, para etiquetar")
    ap.add_argument("--tol", type=int, default=16, help="distancia RGB máxima dentro de una banda")
    ap.add_argument("--min", type=int, default=1, help="alto mínimo de banda a imprimir")
    args = ap.parse_args()

    names = {hex_to_rgb(c): "#" + c.strip().lstrip("#") for c in args.colors.split(",") if c}
    image = Image.open(args.png).convert("RGB")
    width, height = image.size
    span = height if args.axis == "y" else width

    def pixel(pos: int) -> tuple[int, int, int]:
        return image.getpixel((args.at, pos) if args.axis == "y" else (pos, args.at))

    def label(color: tuple[int, int, int]) -> str:
        if not names:
            return ""
        best, best_dist = None, None
        for target, name in names.items():
            dist = sum(abs(color[i] - target[i]) for i in range(3))
            if best_dist is None or dist < best_dist:
                best, best_dist = name, dist
        return best if best_dist <= args.tol else f"?{best}"

    print(f"{args.png} · {args.axis}={args.at} · {width}x{height}")
    start = 0
    for pos in range(1, span + 1):
        if pos == span or sum(
            abs(pixel(pos)[i] - pixel(start)[i]) for i in range(3)
        ) > args.tol:
            stop = pos - 1
            if stop - start + 1 >= args.min:
                color = pixel((start + stop) // 2)
                tag = label(color)
                print(
                    "  %4d – %4d (%3dpx)  #%02x%02x%02x %s"
                    % (start, stop, stop - start + 1, *color, tag)
                )
            start = pos


if __name__ == "__main__":
    main()
