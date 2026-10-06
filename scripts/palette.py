#!/usr/bin/env python
"""palette.py — qué colores hay realmente en una zona de una captura.

Sirve para cerrar dudas que el código de referencia de Figma deja abiertas
(¿este párrafo es `text-white` o `#b1c2da`?): en vez de creerle al export, se
mira el render y se listan los colores más frecuentes que NO son el fondo.

    python scripts/palette.py design/shot/plan-dt.png --box=56,352,300,30 --bg=2463ff
    python scripts/palette.py design/shot/plan-dt.png --box=56,352,300,30 --bg=2463ff --top=8

`--box` son px **de la imagen** (x,y,ancho,alto). `--bg` acepta varios colores
separados por coma (`--bg=2463ff,0d1e3a`) y `--tol` ajusta la distancia mínima
para considerar un píxel "contenido" (por defecto 48, suma de diferencias RGB).

Salida: los N colores más frecuentes con su conteo y su distancia al fondo más
cercano, pensada para leer de un vistazo si el texto es blanco puro, gris azulado
o celeste.
"""

import argparse
import collections
from PIL import Image


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip().lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("png")
    ap.add_argument("--box", required=True, help="x,y,w,h en px de la imagen")
    ap.add_argument("--bg", required=True, help="uno o más hex separados por coma")
    ap.add_argument("--tol", type=int, default=48)
    ap.add_argument("--top", type=int, default=5)
    args = ap.parse_args()

    x, y, w, h = (int(v) for v in args.box.split(","))
    backgrounds = [hex_to_rgb(c) for c in args.bg.split(",")]

    image = Image.open(args.png).convert("RGB")
    crop = image.crop((x, y, x + w, y + h))

    counter: collections.Counter[tuple[int, int, int]] = collections.Counter()
    for pixel in crop.getdata():
        nearest = min(
            sum(abs(pixel[i] - bg[i]) for i in range(3)) for bg in backgrounds
        )
        if nearest > args.tol:
            counter[pixel] += 1

    total = crop.size[0] * crop.size[1]
    print(f"{args.png} · box {x},{y} {w}x{h} · fondo {'/'.join(args.bg)}")
    if not counter:
        print("  (ningún píxel se aleja más de %d del fondo)" % args.tol)
        return

    for color, count in counter.most_common(args.top):
        nearest = min(sum(abs(color[i] - bg[i]) for i in range(3)) for bg in backgrounds)
        print(
            "  #%02x%02x%02x · %5d px · %5.2f%% · dist al fondo %d"
            % (*color, count, 100 * count / total, nearest)
        )


if __name__ == "__main__":
    main()
