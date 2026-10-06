# Leer Figma con fidelidad

Capturas y descripciones producen aproximaciones. Estos tres scripts leen la
**verdad del archivo** y permiten cerrar el círculo diseño ↔ código:

| Herramienta | Responde |
| --- | --- |
| `figma.mjs` | ¿Qué dice el diseño? Medidas, auto-layout, tipografía, colores, gradientes, estilos por rango, vectores, assets. |
| `measure.mjs` | ¿Qué renderiza el navegador? Vuelca el DOM medido (geometría, layout efectivo, tipografía computada, color) y captura el viewport. |
| `pixel-diff.py` | ¿Cuánto se parecen? Diff píxel a píxel contra el export de Figma + máscara de diferencias. |
| `section-diff.py` | ¿Cuánto se parece **una sección**? Recorta el frame en la captura del sitio, la alinea contra el export de Figma, y reporta coincidencia, offset global y las bandas que no cierran con el offset local que las explica. |
| `palette.py` | ¿De qué color es *de verdad* ese texto? Lista los colores más frecuentes de una zona descontando el fondo (sirve para zanjar `text-white` vs `#b1c2da` mirando el render, no el export). |
| `runs.py` | ¿Dónde empieza y termina cada banda? Recorre una columna o fila y lista los tramos de color en px exactos (sobre un export 1:1 de un nodo: la tarjeta mide X, el separador arranca en Y). |
| `fetch-assets.mjs` | Baja a `design/assets/` los SVG/PNG que el MCP de Figma sirve en `localhost:3845/assets/<hash>` (los vectores tal cual, para trazarlos sin adivinar). |

Las dos primeras no tienen dependencias (Node 20+). `pixel-diff.py` necesita
Pillow (`pip install pillow`).

## 0 · Token

Un Personal Access Token de Figma con scope **`file_read`**. Nunca por chat:

```bash
echo "figd_xxxxxxxx" > .figma-token   # ya está en .gitignore
# o bien: export FIGMA_TOKEN=figd_xxxxxxxx
```

## 1 · Qué dice el diseño

```bash
# todo junto: spec + preview PNG@2x + preview SVG con ids + assets raster
npm run figma -- all "https://www.figma.com/design/<fileKey>/<nombre>?node-id=4-14123"

# sólo la spec (rápido)
npm run figma -- spec 8MLojKHAFEE3rGYwgROC4h 4:14123
```

Salida en `design/<fileKey>-<nodeId>/` (carpeta gitignored):

- `spec.md` / `spec.json` — árbol con geometría relativa al frame, layout,
  tipografía, color, y al final fuentes / tamaños / paleta / gradientes /
  efectos / vectores / imageRefs.
- `preview@2x.png` — render del nodo (con alfa).
- `preview.svg` — export con `svg_include_id=true`: cada elemento lleva
  `id="4:14139"`, así se puede mapear cualquier pieza de vuelta al nodo.

### Cómo se lee la spec

```
#4:14139  FRAME "Promesa principal" · 792x523 @ 80,226.5 · [vertical] · gap 28 ·
          pad 0 0 0 0 · align MIN/MIN · w:FILL h:HUG grow:1 · constraints LEFT/TOP
#4:14141    TEXT "Título principal" · 792x272 @ 80,271.5 · w:FILL h:HUG
            align:stretch · fill #ffffff · text "Diseño y desarrollo web …" ·
            Inter 600 · 64px/67.84px(FONT_SIZE_%) · align LEFT/TOP ·
            autosize:HEIGHT · spans "convertir." [71..81) fill #9bc5ff
```

- `1440x120 @ 0,0` → ancho × alto y posición **relativa al frame raíz**.
- `[vertical]` / `[horizontal]` + `gap` + `pad t r b l` + `align primary/counter`
  → el auto-layout, traducible directo a flex.
- `w:FILL | HUG | FIXED` → `flex:1` | `max-content` | ancho fijo. `grow:1` y
  `align:stretch` son parte del layout, no decoración.
- `POSITION:ABSOLUTE` → hijo fuera del flujo (con sus `@ x,y` exactos).
- `stroke t1 r0 b0 l0` → borde **arriba solamente** (ojo: no es "border-y").
- `fill #9bc5ff a0.14` / `stroke 1px #9bc5ff a0.14 INSIDE` → el `a0.x` es el alfa
  **real** del paint: el producto del alfa del color y de `paint.opacity`. Si se
  ignora, un borde al 14% se pinta al 100% y la sección se ve "más fuerte" que
  el diseño. En Tailwind v4: `border-sky/[0.1412]`.
- `opacity 0.5` (sin `a`) → opacidad **del nodo**, o sea de la capa completa.
- `GRADIENT_RADIAL handles (…) stops …` → la elipse real del gradiente; los
  handles permiten reconstruirla (ver `HeroConceptCard.tsx` para el caso resuelto).
- `autosize:HEIGHT | WIDTH_AND_HEIGHT | NONE` + `text "…"` escapado → los saltos
  de línea son exactos, no interpretados.
- `spans` → **estilos por rango de caracteres**. Sin esto, una palabra en otro
  color dentro de un párrafo es invisible: el fill del nodo reporta el color base.
- `IMAGE <imageRef>` → correr `npm run figma -- assets` para bajarla.
- La cabecera indica el **canvas de la página**: si el frame no tiene fill
  propio, ese es el fondo que se ve detrás.

### Flags útiles

```
--geo          pide geometry=paths (trazados vectoriales, archivo más grande)
--depth=N      limita la profundidad del árbol (útil en frames enormes)
--scale=3      resolución del PNG exportado
--page=false   saltea la consulta del canvas de la página
```

## 2 · Qué renderiza el navegador

```bash
npm run dev                                     # en otra terminal
node scripts/measure.mjs --url=http://localhost:3000/ --viewport=1440x912 --png
node scripts/measure.mjs --viewport=1920x912 --png --name=live-1920 --full
```

Salida: `design/live-<W>x<H>.md` (mismo formato que `spec.md`, para comparar
línea por línea), `.json`, y `.png` con `--png`.

- Espera a `document.fonts.ready` y a que **terminen las animaciones de entrada**.
  Medir a mitad de un tween de GSAP devuelve coordenadas corridas y capturas
  translúcidas → falsas "diferencias". Con `--instant` se fuerza el estado final.
- `--full` captura la página completa; `--depth=N` acota el árbol.

## 3 · Cuánto se parecen

```bash
python scripts/pixel-diff.py design/live-1440.png \
  "design/8MLojKHAFEE3rGYwgROC4h-4-14123/preview@2x.png" \
  --out=design/diff-1440.png
```

- Compone el export de Figma sobre el fondo del sitio (`--bg`, por defecto el
  `#0a0f1a` de `--background`) porque el PNG de Figma viene con alfa.
- Imprime el % de coincidencia (`--tol=8`) y los peores puntos.
- La máscara muestra **dónde** está la diferencia: bordes de glifos y trazos de
  1px = antialiasing (esperable); manchas o bloques = diferencia real.
- `--probe="1144,420;1000,300"` compara píxeles puntuales: ideal para muestrear
  un gradiente.
- **Barrido de tolerancia** para saber si el residuo es real o es ruido de
  rasterizado: 94.65% a `--tol=8` → 97.97% a `--tol=96` = es **antialiasing de
  texto** (Figma rasteriza con su motor, Chrome con subpíxel). No se persigue.
  Si en cambio hay un **bloque** sólido en la máscara, eso sí es real: `--probe`
  en el interior de una forma rellena lo dirime en un píxel (`36,99,255` vs
  `36,99,255` = idéntico; el borde de un glifo es lo único que difiere).
- Medir contra el **dev server** mete el badge "N" de Next (abajo a la
  izquierda) en la captura: cuenta como diferencia y no es parte del diseño.

## 4 · Qué mandarme para construir una sección

1. La **URL del frame con `?node-id=`** (o `fileKey` + `nodeId`). Es lo único
   imprescindible: de ahí sale todo lo demás.
2. Los **viewports objetivo** (p. ej. 1440 de diseño + tablet 1024 + mobile 390).
3. El token en `.figma-token` (o `FIGMA_TOKEN` en el entorno del IDE) — así no
   viaja por el chat.
4. Si el diseño usa **fuentes que no están en Google Fonts**, el archivo `.woff2`
   (como pasó con Rubik One, que se auto-hospeda en `app/fonts/`).
5. Si hay **ilustraciones raster**, correr `figma.mjs assets` y decir dónde
   quedaron; una captura no permite reconstruirlas.

Con (1) ya puedo hacer: `figma.mjs all` → leer `spec.md` → construir →
`measure.mjs` → `pixel-diff.py` y mostrar el número.

## 5 · La vía MCP (Figma Dev Mode) — opcional

Figma Desktop → *Preferences* → **Enable Dev Mode MCP Server** levanta
`http://127.0.0.1:3845/mcp` (Streamable HTTP). Ojo: es **otra cosa** que la API
REST — no usa PAT, se autentica con la sesión de la app de escritorio. El
`.figma-token` no influye para nada acá.

```bash
node scripts/mcp-check.mjs      # handshake real: initialize → initialized → tools/list
```

Hay tres requisitos y el error delata cuál falta:

| Error | Qué pasa |
| --- | --- |
| `ECONNREFUSED` | Figma Desktop cerrado, el toggle apagado, o el puerto 3845 ocupado por otro proceso. |
| `-32000` *Invalid request body for initialize request* | Mandaste una request sin `Mcp-Session-Id` sin haber hecho `initialize` antes. |
| `-32001` *Invalid sessionId* | Sesión **cacheada muerta** (el `Mcp-Session-Id` cambió). Toggle del server en el IDE o apagar/encender el toggle en Figma, y reconectar. Reintentar no alcanza. |
| `-32002` *No session found for sessionId* | Id bien formado pero inexistente/vencido: mismo caso que arriba. |
| `-32603` *The MCP server is only available if your active tab is a design or FigJam file* | La **pestaña activa** de Figma Desktop no es un archivo de diseño/FigJam (estás en Home, comunidad, etc.). |
| `HTTP 400` con `Accept: application/json` | El server exige `Accept: application/json, text/event-stream` en cada POST. |

Config para Cline (MCP Servers → Remote → Streamable HTTP), **sin token**:

```json
{ "mcpServers": { "figma-dev-mode": { "type": "streamableHttp", "url": "http://127.0.0.1:3845/mcp" } } }
```

Herramientas que expone: `get_design_context` (la principal), `get_variable_defs`,
`get_screenshot`, `get_motion_context`, `get_metadata`, `get_code_connect_map`,
`add_code_connect_map`, `get_code_connect_suggestions`,
`send_code_connect_mappings`, `get_figjam`. Requieren la app abierta, el archivo
de diseño activo y (si no pasás `nodeId`) una selección.

### Invocar una tool por terminal (sin IDE)

```bash
node.exe scripts/mcp-check.mjs --call=get_metadata --args='{"nodeId":"4:14123"}'
node.exe scripts/mcp-check.mjs --call=get_variable_defs --args='{"nodeId":"4:14123"}'
node.exe scripts/mcp-check.mjs --call=get_design_context \
  --args='{"nodeId":"4:14123","fileKey":"8MLojKHAFEE3rGYwgROC4h"}' > design/mcp-design-context.txt
```

> `node.exe` y no `node`: el alias `node`→`winpty` rompe cualquier redirección
> de salida ("stdout is not a tty").

`get_design_context` devuelve código de referencia React+Tailwind con
`data-node-id` en cada elemento, un screenshot, y notas con los estilos del
diseño. Los vectores quedan servidos en `http://localhost:3845/assets/<hash>.svg`
mientras Figma esté abierto: se pueden descargar directo. `get_variable_defs`
da los tokens del diseño (en este archivo: `radius/control: 8`,
`space/12: 12`, `Balrok/Body` = Inter 400 16/1.6, `Balrok/Caption` =
Inter 500 12/1.5).

Estado verificado: `✓ initialize · ✓ initialized · ✓ tools/list (10 tools) ·
✓ tools/call` sobre `Figma Dev Mode MCP Server 1.0.0`.

## 6 · Lo que aprendimos midiendo secciones

Tres reglas que salieron de cerrar Beneficios, Servicios, Plan, Proceso,
Criterios, FAQ, Contacto y Pie de página a 1:1, y que ahorran horas la próxima:

1. **Figma redondea cada caja de línea a un número entero; el navegador no.** Un
   párrafo de 16px con `1.6` mide 25.6px por línea en Chrome y 26 en Figma; el
   `.6` se acumula por línea y por bloque. En secciones de un solo texto casi no
   se nota, pero en una columna de cuatro etapas son 6px. Cuando la sección es
   altura automática, clavar el `leading` en px (`leading-[26px]`) es lo que
   hace que el total dé exacto. Medido sobre el export 1:1 de una etapa: las dos
   líneas de la descripción pitchan exactamente 26, no 25.6.
2. **El stroke de Figma va por dentro del marco.** En una tarjeta de altura
   automática un `border` de CSS agrega 2px (711 → 713). Se resuelve con
   `inset-ring inset-ring-<color>` (Tailwind v4), y en una hairline de un solo
   lado (arriba/abajo) con `pt-[altura-1]` para que el contenido siga arrancando
   donde dice el diseño.
3. **Un export 1:1 de un sub-nodo es la fuente de verdad más barata.** El MCP
   limita las capturas a 1024px del lado largo, así que conviene pedir el nodo
   chico (`get_screenshot` de la tarjeta, 672×503) y medirlo con `runs.py`: ahí
   se ven los separadores, el botón y las etiquetas sin la bruma del reescalado.
   Es lo que resolvió por qué la tarjeta del Plan medía 506 y no 503.

Y una que no es una regla sino un límite: **Inter mide ~1% más ancho en el
navegador que en el archivo.** Cuando un corte de línea cae justo en el borde
(«…un mail corporativo,» en el FAQ de mobile) esa diferencia decide una línea
entera; se corrige con un `tracking` mínimo y documentado, no con un ancho
inventado.

## 7 · Problemas conocidos (y cómo se detectan)

| Síntoma | Causa real |
| --- | --- |
| El render no coincide y las medidas dan 16px | **Serve viejo**: quedó un `next dev` de otra sesión en otro puerto (o caché del navegador). `measure.mjs` imprime la URL que midió. |
| Capturas translúcidas / coordenadas corridas | Se midió a mitad del tween de entrada (GSAP). El script ya espera; si no asienta, lo avisa. |
| `node … \| tail` no imprime nada | En este shell `node` está aliasado a `winpty node.exe`, que falla cuando stdout no es TTY. Redirigir a archivo (`> out.txt`) y leer el archivo. |
| El fondo sale distinto al diseño | El frame no tiene fill: mirar el **canvas de la página** que imprime la spec (ojo, `#1e1e1e` es el gris de la UI de Figma, no una decisión de diseño). |
| Faltan colores en un texto | Estilos **por rango**: buscar `spans` en la línea del nodo. |
| Un trazo sale **más fuerte** que el diseño (un borde al 14% se ve al 100%) | Figma guarda la opacidad de un *paint* en `paint.opacity`, aparte del alfa del color (`color.a`): hay que **multiplicarlos**. Leer sólo `color.a` la pierde en silencio (y `hex()` ya imprimía `a0.x` para las sombras, así que la spec *parecía* correcta). Se detecta en 10s exportando el vector: el SVG de `http://localhost:3845/assets/<hash>.svg` trae `stroke-opacity="0.141176"`. |
