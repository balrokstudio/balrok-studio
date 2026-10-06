"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Proceso" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14318, 1440 × 594
 *       fondo #f2f6ff · padding 104 / 80 · gap 48 · encabezado gap 20 ·
 *       etapas en fila, ancho completo con gap 32 (296 × 4 + 96 = 1280)
 *   · Mobile azul frame → node 4:14671, 390 × 1249
 *       padding 64 / 24 · gap 32 · etapas apiladas, gap 32 · título 32px
 *
 * Cada etapa abre con una regla superior de 2px #2463ff y `pt 20`. En Figma ese
 * trazo va por dentro del marco, así que muerde los primeros 2px del padding:
 * el borde CSS va con `pt-[18px]` para que el primer hijo arranque igual a 20px
 * del borde y la etapa siga midiendo 221 (247 la de descripción larga) en vez
 * de 223.
 *
 * El número de paso es IBM Plex Mono 32px con `leading normal`, que mide 42px
 * —los mismos que pide la fila `Secuencia`—, así que esa fila no depende del
 * icono de 20px que va a la derecha.
 *
 * Los `leading` de los cuatro textos van en px enteros a propósito: Figma
 * redondea cada caja de línea a un número entero (medido sobre el export a 1:1
 * de una etapa: las dos líneas de la descripción pitchean exactamente 26px, no
 * los 25.6 de `1.6 × 16`), y como las etapas son altura automática y se apilan,
 * la diferencia se multiplica por cuatro: con los valores del diseño la sección
 * mide 594 (DT) y 1249 (MB) clavados.
 */

const STAGES = [
  {
    step: "01",
    title: "Brief",
    description:
      "Entendemos tu negocio, tus objetivos y lo que necesita tu audiencia.",
    deliverable: "Objetivos y alcance definidos",
  },
  {
    step: "02",
    title: "Diseño",
    description:
      "Organizamos el contenido y diseñamos una experiencia visual clara.",
    deliverable: "Propuesta UI/UX para revisar",
  },
  {
    step: "03",
    title: "Desarrollo",
    description:
      "Construimos tu sitio y probamos su funcionamiento en cada dispositivo.",
    deliverable: "Web responsive y optimizada",
  },
  {
    step: "04",
    title: "Lanzamiento",
    description:
      "Conectamos el dominio, publicamos y acompañamos tu nueva etapa.",
    deliverable: "Sitio en línea y soporte continuo",
  },
];

function IconArrowRight() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-brand"
      aria-hidden="true"
    >
      <path d="M4.166 10H15.834M10 15.834L15.834 10L10 4.166" />
    </svg>
  );
}

export default function ProcessSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="proceso" ref={rootRef} className="relative z-10 bg-mist">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-16 sm:px-10 lg:gap-12 lg:px-20 lg:py-[104px]">
        {/* Encabezado de sección */}
        <div className="flex flex-col gap-5">
          <p
            data-reveal
            className="font-code text-[11px] leading-[17px] text-brand opacity-0"
          >
            04 / ASÍ TRABAJAMOS
          </p>
          <h2
            data-reveal
            className="font-body text-[32px] leading-[36px] font-semibold text-ink opacity-0 lg:text-[48px] lg:leading-[54px]"
          >
            Un proceso claro. De principio a fin.
          </h2>
        </div>

        {/* Etapas */}
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
          {STAGES.map((stage) => (
            <div
              key={stage.step}
              data-reveal
              className="flex w-full flex-col gap-5 border-t-2 border-brand pt-[18px] opacity-0 lg:min-w-px lg:flex-1"
            >
              <div className="flex w-full items-center justify-between">
                <p className="font-code text-[32px] leading-[normal] whitespace-nowrap text-brand">
                  {stage.step}
                </p>
                <IconArrowRight />
              </div>
              <h3 className="font-body text-[24px] leading-[29px] font-semibold text-ink">
                {stage.title}
              </h3>
              <p className="font-body text-[16px] leading-[26px] text-steel">
                {stage.description}
              </p>
              <p className="font-code text-[11px] leading-[18px] text-brand">
                {stage.deliverable}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
