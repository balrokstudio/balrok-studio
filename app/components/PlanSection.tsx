"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Plan integral" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14271, 1440 × 835
 *       fondo #2463ff · padding 104 / 80 · dos columnas con gap 112:
 *       intro fija de 496 (gap 28) + tarjeta que ocupa los 672 restantes ·
 *       tarjeta bg #0d1e3a, 1px #2463ff, radius 16, padding 32, gap 24 ·
 *       precio 40px · botón 52px con glow #2463ff a0.25
 *   · Mobile azul frame → node 4:14625, 390 × 1264
 *       padding 64 / 24 · apilado, gap 40 · precio 28px · padding 24
 *
 * La tarjeta se pinta con `inset-ring` y no con `border` por el mismo motivo
 * que en Beneficios: el stroke de Figma va por dentro, y un borde CSS de 1px
 * agrega 2px a una tarjeta de altura automática.
 * Precio y cierre mono cambian de copia por breakpoint, así que viven en dos
 * spans y no en el mismo texto reflowado.
 *
 * La lista «Incluye» (gap 16) abre con dos prestaciones destacadas —fondo
 * #142c50 y borde #2463ff, semibold— y sigue con cinco normales. Igual que la
 * tarjeta, las destacadas llevan `inset-ring` y no `border`: un borde CSS las
 * crecería 2px a cada una (y la tarjeta es altura automática). Su padding
 * vertical difiere por breakpoint (12px en DT, 10px en MB): `px-3 py-[10px]
 * lg:p-3`.
 *
 * Dos line-heights están clavados en px porque Figma no los resuelve como el
 * navegador y la tarjeta es altura automática, así que cada décima se acumula:
 * cada «Prestación» ocupa 22px —no los 22.4 de `1.6 × 14`— y la etiqueta
 * «Todo incluido» 25px —no los 26 que da `normal`. Con los valores del diseño
 * la sección mide 835.2 (DT) y 1262.5 (MB) desde que el plan pasó a 7 ítems.
 */

/* El plan ahora lista las dos primeras prestaciones como destacadas (disco
   con fondo #142c50 y borde #2463ff) y el resto normales. El diseño manda el
   texto exacto, incluyendo el paréntesis de "Dominio propio (.com.ar / .com)". */
const FEATURES = [
  { highlighted: true, label: "Diseño UX/UI a medida incluido" },
  { highlighted: true, label: "Desarrollo web integral incluido" },
  { highlighted: false, label: "Dominio propio (.com.ar / .com )" },
  { highlighted: false, label: "Hosting de alta velocidad y seguridad garantizada" },
  { highlighted: false, label: "1 usuario de mail profesional corporativo" },
  { highlighted: false, label: "Optimización SEO inicial para aparecer en Google" },
  { highlighted: false, label: "Mantenimiento y soporte técnico continuo" },
];

/* Vectors traced from the Figma nodes (stroke width 1.6). */

function IconLayers() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-white"
      aria-hidden="true"
    >
      <path d="M1.9992 11.9998C1.99873 12.191 2.05312 12.3784 2.15593 12.5397C2.25874 12.701 2.40565 12.8295 2.57924 12.9098L11.1798 16.82C11.4391 16.9374 11.7203 16.9981 12.0049 16.9981C12.2895 16.9981 12.5707 16.9374 12.83 16.82L21.4106 12.9198C21.5876 12.8402 21.7376 12.7109 21.8424 12.5475C21.9472 12.3842 22.0021 12.1938 22.0006 11.9998M1.9992 17C1.99873 17.1913 2.05312 17.3787 2.15593 17.54C2.25874 17.7013 2.40565 17.8298 2.57924 17.9101L11.1798 21.8203C11.4391 21.9377 11.7203 21.9984 12.0049 21.9984C12.2895 21.9984 12.5707 21.9377 12.83 21.8203L21.4106 17.9201C21.5876 17.8405 21.7376 17.7112 21.8424 17.5478C21.9472 17.3844 22.0021 17.1941 22.0006 17M12.8304 2.17957C12.5698 2.06071 12.2868 1.9992 12.0004 1.9992C11.7139 1.9992 11.4309 2.06071 11.1703 2.17957L2.59969 6.07978C2.42223 6.15803 2.27135 6.28619 2.16543 6.44866C2.0595 6.61113 2.00311 6.80089 2.00311 6.99484C2.00311 7.18878 2.0595 7.37854 2.16543 7.54101C2.27135 7.70348 2.42223 7.83164 2.59969 7.90989L11.1803 11.8201C11.4409 11.939 11.7239 12.0005 12.0104 12.0005C12.2968 12.0005 12.5798 11.939 12.8404 11.8201L21.421 7.91989C21.5985 7.84164 21.7494 7.71348 21.8553 7.55101C21.9612 7.38854 22.0176 7.19878 22.0176 7.00484C22.0176 6.81089 21.9612 6.62113 21.8553 6.45866C21.7494 6.2962 21.5985 6.16803 21.421 6.08979L12.8304 2.17957Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-sky"
      aria-hidden="true"
    >
      <path d="M14.9994 4.5L6.75023 12.7494L3.0006 8.99967" />
    </svg>
  );
}

function IconArrowUpRight() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-white"
      aria-hidden="true"
    >
      <path d="M12.7494 12.7494V5.2506H5.2506M12.7494 5.2506L5.2506 12.7494" />
    </svg>
  );
}


export default function PlanSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="plan-integral" ref={rootRef} className="relative z-10 bg-brand">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:gap-[112px] lg:px-20 lg:py-[104px]">
        {/* Propuesta */}
        <div className="flex w-full flex-col gap-7 lg:w-[496px] lg:shrink-0">
          <div className="flex flex-col gap-5">
            <p
              data-reveal
              className="font-code text-[11px] leading-[1.5] text-sky opacity-0"
            >
              03 / SIMPLE DESDE EL INICIO
            </p>
            <h2
              data-reveal
              className="font-body text-[32px] font-semibold leading-[1.12] text-white opacity-0 lg:text-[48px]"
            >
              Tu web resuelta.
              <br />
              Todo en un solo plan.
            </h2>
          </div>

          <p
            data-reveal
            className="font-body text-[18px] leading-[1.6] text-white opacity-0"
          >
            Una presencia digital profesional no debería ser una suma de
            problemas técnicos. Reunimos lo esencial en un servicio integral.
          </p>

          <div data-reveal className="flex w-full gap-3 opacity-0">
            <IconLayers />
            <p className="min-w-px flex-1 font-body text-[16px] leading-[1.5] text-white">
              Diseño, desarrollo e infraestructura conectados por el mismo
              equipo.
            </p>
          </div>

          <p
            data-reveal
            className="font-body text-[13px] leading-[1.6] text-white opacity-0"
          >
            Definimos juntos el alcance de tu sitio antes de comenzar. Las
            funcionalidades especiales se evalúan según las necesidades del
            proyecto.
          </p>

          <p
            data-reveal
            className="hidden font-code text-[12px] leading-[normal] text-sky opacity-0 lg:block"
          >
            MENOS COMPLEJIDAD. MÁS DIRECCIÓN. ↗
          </p>
        </div>

        {/* Oferta */}
        <div className="flex w-full flex-col items-start lg:min-w-px lg:flex-1">
          <div
            data-reveal
            className="flex w-full flex-col gap-6 rounded-2xl bg-[#0d1e3a] p-6 inset-ring inset-ring-brand opacity-0 lg:p-8"
          >
            <div className="flex w-full items-center justify-between">
              <p className="font-body text-[18px] font-semibold leading-[normal] text-white">
                Plan integral
              </p>
              <div className="flex items-start rounded-full bg-[#142c50] px-[10px] py-[6px]">
                <p className="font-body text-[11px] leading-[13px] whitespace-nowrap text-sky">
                  Todo incluido
                </p>
              </div>
            </div>

            <p className="font-body text-[28px] font-semibold leading-[1.2] text-white lg:text-[40px]">
              <span className="lg:hidden">$25.000 ARS al mes</span>
              <span className="hidden lg:inline">$35.000 ARS al mes</span>
            </p>

            <div className="h-px w-full bg-line" />

            <div className="flex w-full flex-col gap-4">
              {FEATURES.map(({ highlighted, label }) => (
                <div
                  key={label}
                  className={
                    highlighted
                      ? "flex w-full items-center gap-3 rounded-lg bg-[#142c50] px-3 py-[10px] inset-ring inset-ring-brand lg:p-3"
                      : "flex w-full items-start gap-3"
                  }
                >
                  <IconCheck />
                  <p
                    className={`min-w-px flex-1 font-body text-[14px] leading-[22px] text-white${highlighted ? " font-semibold" : ""}`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="#contacto"
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-brand px-5 shadow-[0px_4px_24px_0px_rgba(36,99,255,0.25)] transition-transform hover:-translate-y-0.5"
            >
              <p className="font-body text-[14px] font-semibold leading-[normal] whitespace-nowrap text-white">
                Empezar mi proyecto
              </p>
              <IconArrowUpRight />
            </a>

            <p className="font-body text-[12px] leading-[1.6] text-slate">
              Un servicio continuo. Un único punto de contacto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
