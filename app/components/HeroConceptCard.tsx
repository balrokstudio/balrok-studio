"use client";

/**
 * "Concepto de interfaz" visual on the right hand side of the Figma "Inicio"
 * frame (file 8MLojKHAFEE3rGYwgROC4h · node 4:14154).
 *
 * Every measure below is taken from the Figma node tree, in design pixels:
 *   · Diseño conectado (4:14155) 432 × 530, radius 24, clipped, radial gradient
 *   · Vista de diseño  (4:14161) 380 × 370 at (26, 54), radius 12
 *   · Implementación   (4:14187) 310 ×  95 at (98, 400), radius 12
 *   · Órbitas          (4:14156-60) 200…472px rings centred on (216, 180),
 *                                    stroke 1px #9bc5ff INSIDE @ 14% alpha
 */

const ORBIT_SIZES = [472, 404, 336, 268, 200];
const TOOLBAR_DOTS = [0, 1, 2];
const MODULES = [0, 1, 2];

function IconMenu() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function IconEllipsis() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h.01" />
      <path d="M12 12h.01" />
      <path d="M19 12h.01" />
    </svg>
  );
}

export default function HeroConceptCard() {
  return (
    <div className="flex w-[432px] shrink-0 flex-col gap-4">
      {/* Diseño conectado — the gradient panel */}
      <div className="relative h-[530px] w-[432px] overflow-hidden rounded-3xl">
        {/*
          Figma radial gradient (node 4:14155) is an ellipse centred on
          70% / 40% with semi-axes 358.76 × 325.48 rotated -71.45°, and stops
          #2463ff 0% → #103e92 55% → #071226 100%. A square layer holding a
          circular gradient is rotated + squashed to match it exactly.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[70%] top-[40%] h-[717.52px] w-[717.52px]"
          style={{
            background:
              "radial-gradient(circle closest-side, #2463ff 0%, #103e92 55%, #071226 100%)",
            transform: "translate(-50%, -50%) rotate(-71.45deg) scaleY(0.9072)",
          }}
        />

        {/* Implementación — build status panel */}
        <div className="absolute left-[98px] top-[400px] flex h-[95px] w-[310px] flex-col gap-2 rounded-xl border border-line bg-night p-[18px] shadow-[0_24px_64px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2">
            <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-sky" />
            <span className="font-code text-[10px] leading-[13px] text-sky">
              DISEÑO → DESARROLLO
            </span>
          </div>
          {/* El nodo 4:14191 tiene estilos por rango: `<Experience ` (0..12) en
              #9bc5ff y el resto en #b1c2da. */}
          <p className="whitespace-pre font-code text-[12px] leading-[19.2px] text-slate">
            <span className="text-sky">{"<Experience "}</span>
            {`responsive\n  builtFor="people" />`}
          </p>
        </div>

        {/* Vista de diseño — browser mock */}
        <div className="absolute left-[26px] top-[54px] h-[370px] w-[380px] overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)]">
          {/* Barra de archivo */}
          <div className="flex h-10 items-center justify-between bg-mist px-4">
            <div className="flex items-center gap-1">
              {TOOLBAR_DOTS.map((dot) => (
                <span
                  key={dot}
                  className="h-[5px] w-[5px] rounded-full bg-haze"
                />
              ))}
            </div>
            <span className="font-code text-[9px] leading-[11.7px] text-steel">
              BALROK / DIGITAL EXPERIENCE
            </span>
            <span className="text-steel">
              <IconEllipsis />
            </span>
          </div>

          {/* Lienzo de interfaz */}
          <div className="flex h-[330px] flex-col gap-5 p-7">
            {/* Cabecera de concepto */}
            <div className="flex h-4 items-center justify-between">
              <span className="font-body text-[11px] font-bold leading-[13.31px] text-ink">
                tu.marca
              </span>
              <span className="text-ink">
                <IconMenu />
              </span>
            </div>

            {/* Mensaje conceptual */}
            <p className="whitespace-pre font-body text-[36px] font-semibold leading-[37.8px] text-ink">
              {"Tu próxima idea.\nUna mejor\nexperiencia."}
            </p>

            {/* Acciones conceptuales */}
            <div className="flex gap-2">
              <span className="h-[30px] w-[108px] rounded-md bg-brand" />
              <span className="h-[30px] w-[64px] rounded-md border border-haze" />
            </div>

            {/* Módulos de contenido */}
            <div className="flex gap-2">
              {MODULES.map((module) => (
                <div
                  key={module}
                  className="flex h-[54px] flex-1 flex-col gap-2 rounded-md bg-mist p-3"
                >
                  <span className="h-1 w-[30px] rounded-full bg-brand" />
                  <span className="h-[3px] w-full rounded-full bg-haze" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*
          Órbitas — concentric rings, painted above the mock.
          Figma stroke is 1px #9BC5FF, align INSIDE, at 14% alpha (the paint's
          own A field = 36/255 = 0.141176 — confirmed by the SVG export:
          stroke-opacity="0.141176"). Faking it opaque makes the rings read far
          brighter than the design.
        */}
        {ORBIT_SIZES.map((size) => (
          <span
            key={size}
            aria-hidden="true"
            className="absolute left-1/2 top-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/[0.1412]"
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {/* Nota conceptual */}
      <p className="font-code text-[9px] leading-[14.4px] text-slate">
        CONCEPTO DE INTERFAZ / NO ES UN PROYECTO DE CLIENTE
      </p>
    </div>
  );
}
