#!/usr/bin/env python
"""section-diff.py — compara UNA sección del navegador contra su frame de Figma.

`pixel-diff.py` compara dos PNG que ya están a la misma escala y alineados. En
el flujo real eso casi nunca pasa:

  · la captura del MCP viene escalada — su lado mayor se recorta a 1024px, así
    que un frame de 1440 de ancho llega a 1024x486;
  · el recorte del sitio se toma por geometría del DOM (`@ y,h` de measure.mjs),
    con redondeos de subpíxel.

Resultado: un corrimiento de 1-2px que ensucia todos los bordes y hace imposible
distinguir "está mal" de "está 1px corrido".

Este script:
  1. recorta la captura del sitio al frame (`--live-box`) y la reescala al
     tamaño de la captura de Figma (LANCZOS);
  2. busca el offset global (dx, dy) de mínima diferencia media;
  3. imprime la coincidencia por píxel —sobre todo el frame y sólo sobre el
     contenido— y, lo importante, **bandas**: tramos de filas donde la
     diferencia se concentra, con su `y` en píxeles del frame, las columnas
     afectadas y el corrimiento local (dx, dy) que mejor la explica.
     Una banda con dy≠0 es una diferencia de layout; con dx=dy=0 suele ser
     antialiasing de texto (ruido, no error).

Salidas (con `--out=base`):
  base-stack.png    Figma | sitio | máscara de diferencias
  base-overlay.png  rojo = Figma, cian = sitio (coincidencia -> gris/blanco)

Uso:
  python scripts/section-diff.py design/measure/live-servicios-1440.png \\
      design/shot/servicios-dt.png --live-box=0,1539,1440,683 \\
      --out=design/measure/servicios-dt --bg=071226

Requiere Pillow + numpy (`pip install pillow numpy`).
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def parse_box(text):
    """'x,y,w,h' -> caja de recorte de PIL."""
    x, y, w, h = (float(v) for v in text.split(","))
    return (int(round(x)), int(round(y)), int(round(x + w)), int(round(y + h)))


def open_rgb(path, bg, box=None):
    """abre `path`, lo recorta y compone el alfa sobre `bg`."""
    img = Image.open(path)
    if box:
        img = img.crop(box)
    if img.mode != "RGB":
        img = img.convert("RGBA")
        base = Image.new("RGB", img.size, bg)
        base.paste(img, (0, 0), img)
        return base
    return img.convert("RGB")


def gray(img, sigma):
    if sigma:
        img = img.filter(ImageFilter.GaussianBlur(sigma))
    return np.asarray(img.convert("L"), dtype=np.float32)


def aligned(a, b, dx, dy):
    """vistas solapadas de `a` (desplazada dx,dy) y `b` + la caja del solape."""
    h, w = b.shape[:2]
    ax, ay = max(0, dx), max(0, dy)
    bx, by = max(0, -dx), max(0, -dy)
    n = min(h - ay, h - by)
    m = min(w - ax, w - bx)
    return a[ay : ay + n, ax : ax + m], b[by : by + n, bx : bx + m], (ax, ay, bx, by, n, m)


def mad(a, b, mask=None):
    d = np.abs(a - b)
    if mask is None:
        return float(d.mean())
    n = int(mask.sum())
    return float(d[mask].sum() / n) if n else float("inf")


def best_offset(shot, live, content, radius, dx_radius=None):
    """(dx, dy) que mejor alinea `live` con `shot` mirando sólo el contenido."""
    out, best = (0, 0), None
    for dy in range(-radius, radius + 1):
        for dx in range(-(dx_radius or radius), (dx_radius or radius) + 1):
            a, b, _ = aligned(shot, live, dx, dy)
            ca, cb, _ = aligned(content, content, dx, dy)
            m = ca & cb
            if not m.any():
                continue
            bad = mad(a, b, m)
            if best is None or bad < best:
                out, best = (dx, dy), bad
    return out, best


def bands(rows, gap=3, min_len=2):
    """tramos contiguos (con tolerancia `gap`) de filas marcadas."""
    out, start, prev = [], None, None
    for i in np.nonzero(rows)[0]:
        if start is None or i - prev > gap:
            if start is not None and prev - start + 1 >= min_len:
                out.append((int(start), int(prev)))
            start = i
        prev = i
    if start is not None and prev - start + 1 >= min_len:
        out.append((int(start), int(prev)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("live", help="captura del sitio (página completa o ya recortada)")
    ap.add_argument("shot", help="captura del frame en Figma (la del MCP, escalada)")
    ap.add_argument("--live-box", help='recorte del sitio "x,y,w,h" en px de la captura')
    ap.add_argument("--bg", default="071226", help="fondo del frame (para el alfa de Figma)")
    ap.add_argument("--tol", type=int, default=12, help="delta para contar igual (0-255)")
    ap.add_argument("--search", type=int, default=10, help="radio del offset global (px captura)")
    ap.add_argument("--sigma", type=float, default=0.8, help="blur previo al análisis")
    ap.add_argument("--band-th", type=float, default=9.0, help="diferencia por fila que abre banda")
    ap.add_argument("--min-band", type=int, default=2, help="altura mínima de una banda")
    ap.add_argument("--max-bands", type=int, default=12, help="cuántas bandas listar")
    ap.add_argument("--out", help="base de salida: <out>-stack.png y <out>-overlay.png")
    args = ap.parse_args()

    bg = hex_rgb(args.bg)
    bg_lvl = float(np.mean(bg))
    shot_img = open_rgb(args.shot, bg)
    live_img = open_rgb(args.live, bg, parse_box(args.live_box) if args.live_box else None)
    native = live_img.size  # 1:1 con el frame

    if live_img.size != shot_img.size:
        live_img = live_img.resize(shot_img.size, Image.LANCZOS)
    factor = native[1] / shot_img.size[1]  # px del frame por px de la captura
    print(f"Figma {shot_img.size} · sitio {native} · x{factor:.4f} (px de captura -> px de frame)")

    asp_s = shot_img.size[0] / shot_img.size[1]
    asp_l = native[0] / max(1, native[1])
    if abs(asp_s - asp_l) > 0.02:
        print(
            f"aviso: el aspecto no coincide (Figma {asp_s:.3f} vs sitio {asp_l:.3f}): "
            "el recorte no es el frame completo o la altura de Figma no es la de la captura"
        )
    implied = shot_img.size[1] / shot_img.size[0] * native[0]
    print(
        f"altura que implica la captura de Figma: {implied:.1f}px de frame "
        f"(el recorte mide {native[1]}px -> delta {native[1] - implied:+.1f}px)"
    )

    shot_g = gray(shot_img, args.sigma)
    live_g = gray(live_img, args.sigma)
    content = (np.abs(shot_g - bg_lvl) > 8) | (np.abs(live_g - bg_lvl) > 8)

    (dx, dy), global_bad = best_offset(shot_g, live_g, content, args.search)
    print(f"offset global: dx {dx:+d} dy {dy:+d} px de captura · diferencia media {global_bad:.2f}")

    sg_ov, lg_ov, (ax, ay, bx, by, n, m) = aligned(shot_g, live_g, dx, dy)
    ca, cb, _ = aligned(content, content, dx, dy)
    keep = ca & cb
    s_ov, l_ov = aligned(
        np.asarray(shot_img, dtype=np.float32), np.asarray(live_img, dtype=np.float32), dx, dy
    )[:2]
    delta = np.abs(s_ov - l_ov).max(axis=2)

    def share(mask):
        if not mask.any():
            return float("nan")
        return 100.0 * float((delta[mask] <= args.tol).sum()) / float(mask.sum())

    print(
        f"coincidencia (delta<={args.tol}): {share(np.ones_like(delta, dtype=bool)):.2f}% del frame"
        f" · {share(keep):.2f}% del contenido"
    )
    print(f"solape analizado: {m}x{n} px de captura = {m * factor:.0f}x{n * factor:.0f} px de frame")

    row_mad = np.zeros(delta.shape[0])
    for y in range(delta.shape[0]):
        row = keep[y]
        if row.any():
            row_mad[y] = delta[y][row].mean()
    found = bands(row_mad > args.band_th, min_len=args.min_band)
    print(
        f"\nbandas con diferencia media > {args.band_th:.0f} ({len(found)})"
        " · y y x en px del frame · offset local que la explica:"
    )
    for y0, y1 in found[: args.max_bands]:
        sub = np.where(keep[y0 : y1 + 1], delta[y0 : y1 + 1], 0.0)
        cols = np.nonzero(sub.max(axis=0) > args.band_th)[0]
        x0, x1 = (int(cols.min()), int(cols.max())) if cols.size else (-1, -1)
        pad = 16
        w0, w1 = max(0, y0 - pad), min(delta.shape[0], y1 + 1 + pad)
        local, local_bad = (0, 0), None
        for ldy in range(-6, 7):
            for ldx in range(-6, 7):
                aa, bb, _ = aligned(sg_ov[w0:w1], lg_ov[w0:w1], ldx, ldy)
                if aa.size == 0:
                    continue
                bad = float(np.abs(aa - bb).mean())
                if local_bad is None or bad < local_bad:
                    local, local_bad = (ldx, ldy), bad
        tag = "layout" if (local[0] or local[1]) else "texto/antialias"
        print(
            f"  y {y0 * factor:7.1f} – {(y1 + 1) * factor:8.1f}"
            f" · x {x0 * factor:6.1f} – {(x1 + 1) * factor:7.1f}"
            f" · pico {float(sub.max()):5.0f} · local dx {local[0]:+d} dy {local[1]:+d} ({tag})"
        )
    if not found:
        print("  (ninguna: coincidencia 1:1 dentro de la tolerancia)")

    if not args.out:
        return

    canvas = Image.new("RGB", shot_img.size, bg)
    canvas.paste(live_img.crop((bx, by, bx + m, by + n)), (ax, ay))

    mask = np.zeros((shot_img.height, shot_img.width, 3), dtype=np.uint8)
    norm = np.clip(delta / max(1.0, float(delta.max())), 0, 1)
    hot = (norm * 255).astype(np.uint8)
    mask[ay : ay + n, ax : ax + m] = np.stack([hot, (hot * 0.35).astype(np.uint8), hot], axis=2)
    mask_img = Image.fromarray(mask, "RGB")

    if shot_img.width >= shot_img.height:  # apaisado -> una encima de otra
        stack = Image.new("RGB", (shot_img.width, shot_img.height * 3 + 12), (17, 17, 17))
        for i, img in enumerate((shot_img, canvas, mask_img)):
            stack.paste(img, (0, i * (shot_img.height + 6)))
    else:  # vertical -> en fila
        stack = Image.new("RGB", (shot_img.width * 3 + 12, shot_img.height), (17, 17, 17))
        for i, img in enumerate((shot_img, canvas, mask_img)):
            stack.paste(img, (i * (shot_img.width + 6), 0))
    stack.save(f"{args.out}-stack.png")

    shot_l = np.asarray(shot_img.convert("L"), dtype=np.uint8)
    live_l = np.asarray(canvas.convert("L"), dtype=np.uint8)
    ov = np.stack([shot_l, live_l, live_l], axis=2)
    Image.fromarray(ov, "RGB").save(f"{args.out}-overlay.png")
    print(f"-> {args.out}-stack.png (figma | sitio | diff) · {args.out}-overlay.png (rojo figma · cian sitio)")


if __name__ == "__main__":
    main()
