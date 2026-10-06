"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Criterios de calidad" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14351, 1440 × 513
 *       fondo #071226 · padding 104 / 80 · fila centrada con gap 104: intro
 *       flexible (555) + tarjeta fija de 621 · tarjeta bg #0d1e3a, 1px #294467,
 *       radius 16, padding 32, gap 24 · filas de criterio 24px de alto
 *   · Mobile azul frame → node 4:14704, 390 × 700
 *       padding 64 / 24 · apilado con gap 40 · tarjeta a ancho completo,
 *       padding 24 · título 32px
 *
 * La tarjeta usa `inset-ring` en vez de `border` (el stroke de Figma va por
 * dentro): con borde CSS la tarjeta mediría 307 y la sección 515 en vez de 513.
 * La columna de texto va con `leading` en px enteros por el redondeo de línea de
 * Figma; acá no cambia la altura de la sección (la tarjeta manda en los dos
 * breakpoints) pero sí la del bloque y la posición del texto dentro de la fila.
 */

const CRITERIA = [
  "Responsive desde el diseño",
  "Accesibilidad y navegación claras",
  "Carga y recursos optimizados",
  "Base técnica fácil de mantener",
];

/* Vectors traced from the Figma nodes (stroke width 1.6). */

function IconShieldCheck() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-sky"
      aria-hidden="true"
    >
      <path d="M9.0003 11.9995L11.0001 13.9996L14.9997 9.99946M19.9992 13C19.9992 18.0002 16.4995 20.5003 12.34 21.9503C12.1222 22.0241 11.8855 22.0206 11.67 21.9403C7.50045 20.5003 4.0008 18.0002 4.0008 13V5.99978C4.0008 5.73455 4.10615 5.48019 4.29366 5.29265C4.48118 5.10511 4.73551 4.99975 5.0007 4.99975C7.0005 4.99975 9.50025 3.79971 11.2401 2.27966C11.4519 2.09865 11.7214 1.9992 12 1.9992C12.2786 1.9992 12.5481 2.09865 12.7599 2.27966C14.5097 3.80971 16.9995 4.99975 18.9993 4.99975C19.2645 4.99975 19.5188 5.10511 19.7063 5.29265C19.8939 5.48019 19.9992 5.73455 19.9992 5.99978V13Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-sky"
      aria-hidden="true"
    >
      <path d="M16.666 5L7.50025 14.166L3.334 9.99964" />
    </svg>
  );
}


export default function CriteriaSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="criterios" ref={rootRef} className="relative z-10 bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:gap-[104px] lg:px-20 lg:py-[104px]">
        {/* Introducción */}
        <div className="flex w-full flex-col gap-5 lg:min-w-px lg:flex-1">
          <p
            data-reveal
            className="font-code text-[11px] leading-[17px] text-sky opacity-0"
          >
            05 / EL DETALLE IMPORTA
          </p>
          <h2
            data-reveal
            className="font-body text-[32px] leading-[36px] font-semibold text-white opacity-0 lg:text-[48px] lg:leading-[54px]"
          >
            Pensada para personas. Construida para durar.
          </h2>
          <p
            data-reveal
            className="font-body text-[16px] leading-[26px] text-slate opacity-0"
          >
            Lo que no se ve también forma parte del diseño. Cuidamos cada capa
            de tu experiencia digital.
          </p>
        </div>

        {/* Checklist de entrega */}
        <div
          data-reveal
          className="flex w-full flex-col gap-6 rounded-2xl bg-[#0d1e3a] p-6 inset-ring inset-ring-line opacity-0 lg:w-[621px] lg:shrink-0 lg:p-8"
        >
          <div className="flex w-full items-center gap-4">
            <IconShieldCheck />
            <p className="min-w-px flex-1 font-code text-[11px] leading-[1.5] text-sky">
              NUESTRO CRITERIO DE ENTREGA
            </p>
          </div>

          <div className="h-px w-full bg-line" />

          {CRITERIA.map((item) => (
            <div key={item} className="flex w-full items-center gap-3">
              <IconCheck />
              <p className="min-w-px flex-1 font-body text-[16px] leading-[1.5] text-white">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
