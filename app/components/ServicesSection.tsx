"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Servicios y alcance" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14232, 1440 × 683
 *       padding 104 / 80 · row gap 104 · intro column fixed at 440, gap 40
 *       card "Conexión de disciplinas": bg #0d1e3a, 1px #294467, radius 16,
 *       padding 24, gap 24 · services column gap 32, each gap 16, pb 32 and a
 *       #294467 hairline below · service title 24px · arrow 20px · icons 32px
 *   · Mobile azul frame → node 4:14586, 390 × 1141
 *       padding 64 / 24 · stacked, gap 40 · section title 32px
 *
 * The mono "UI → WEB" connector is two real hairlines, not a pseudo element:
 * a 1px flex-1 rule on each side of the label, exactly as the auto-layout has it.
 */

const SERVICES = [
  {
    number: "01",
    title: "Diseño UI/UX",
    description:
      "Arquitectura de información, recorridos claros y una interfaz alineada con tu identidad.",
    tags: "Estructura · Wireframes · Diseño responsive",
  },
  {
    number: "02",
    title: "Desarrollo a medida",
    description:
      "Convertimos el diseño en una web rápida, accesible y adaptable a cada pantalla.",
    tags: "Frontend · Integraciones · Formularios",
  },
  {
    number: "03",
    title: "Acompañamiento continuo",
    description:
      "Nos ocupamos de la base técnica para que puedas concentrarte en tu negocio.",
    tags: "Hosting · SEO inicial · Mantenimiento",
  },
];

/* Vectors traced from the Figma nodes: stroke #9BC5FF, width 1.6. */

function IconLayers() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-sky"
      aria-hidden="true"
    >
      <path d="M2.6656 15.9997C2.66497 16.2547 2.7375 16.5046 2.87458 16.7197C3.01165 16.9347 3.20754 17.106 3.43899 17.2131L14.9065 22.4267C15.2521 22.5832 15.6271 22.6642 16.0065 22.6642C16.3859 22.6642 16.761 22.5832 17.1066 22.4267L28.5474 17.2264C28.7834 17.1203 28.9835 16.9479 29.1232 16.73C29.2629 16.5122 29.3362 16.2584 29.3341 15.9997M2.6656 22.6667C2.66497 22.9218 2.7375 23.1716 2.87458 23.3867C3.01165 23.6018 3.20754 23.773 3.43899 23.8801L14.9065 29.0937C15.2521 29.2502 15.6271 29.3312 16.0065 29.3312C16.3859 29.3312 16.761 29.2502 17.1066 29.0937L28.5474 23.8935C28.7834 23.7874 28.9835 23.6149 29.1232 23.3971C29.2629 23.1792 29.3362 22.9255 29.3341 22.6667M17.1072 2.90609C16.7598 2.74761 16.3823 2.6656 16.0005 2.6656C15.6186 2.6656 15.2412 2.74761 14.8937 2.90609L3.46626 8.10638C3.22964 8.21071 3.02847 8.38159 2.88724 8.59822C2.746 8.81484 2.67081 9.06785 2.67081 9.32645C2.67081 9.58504 2.746 9.83806 2.88724 10.0547C3.02847 10.2713 3.22964 10.4422 3.46626 10.5465L14.9071 15.7601C15.2545 15.9186 15.6319 16.0006 16.0138 16.0006C16.3957 16.0006 16.7731 15.9186 17.1205 15.7601L28.5613 10.5599C28.798 10.4555 28.9991 10.2846 29.1404 10.068C29.2816 9.85139 29.3568 9.59838 29.3568 9.33978C29.3568 9.08119 29.2816 8.82817 29.1404 8.61155C28.9991 8.39493 28.798 8.22405 28.5613 8.11971L17.1072 2.90609Z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-sky"
      aria-hidden="true"
    >
      <path d="M24.0006 21.3328L29.3344 16L24.0006 10.6672M7.99936 10.6672L2.6656 16L7.99936 21.3328M19.3336 5.3344L12.6664 26.6656" />
    </svg>
  );
}

function IconArrowUpRight() {
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
      <path d="M14.166 14.166V5.834H5.834M14.166 5.834L5.834 14.166" />
    </svg>
  );
}

export default function ServicesSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="servicios" ref={rootRef} className="relative z-10 bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-start lg:gap-[104px] lg:px-20 lg:py-[104px]">
        <div className="flex w-full flex-col gap-10 lg:w-[440px] lg:shrink-0">
          <div className="flex flex-col gap-5">
            <p
              data-reveal
              className="font-code text-[11px] leading-[1.5] text-sky opacity-0"
            >
              02 / QUÉ HACEMOS
            </p>
            <h2
              data-reveal
              className="font-body text-[32px] font-semibold leading-[1.12] text-white opacity-0 lg:text-[48px]"
            >
              De la primera idea a una web en marcha.
            </h2>
            <p
              data-reveal
              className="font-body text-[16px] leading-[1.6] text-slate opacity-0"
            >
              Diseño y tecnología bajo una misma dirección. Sin piezas sueltas
              ni soluciones genéricas.
            </p>
          </div>

          <div
            data-reveal
            className="flex w-full flex-col gap-6 rounded-2xl border border-line bg-[#0d1e3a] p-6 opacity-0"
          >
            <p className="font-code text-[11px] leading-[1.5] text-sky">
              UN SISTEMA. TODAS LAS CAPAS.
            </p>
            <div className="flex w-full items-center gap-4">
              <IconLayers />
              <span className="h-px flex-1 bg-line" />
              <p className="font-code whitespace-nowrap text-[12px] leading-[normal] text-sky">
                UI → WEB
              </p>
              <span className="h-px flex-1 bg-line" />
              <IconCode />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-8 lg:min-w-px lg:flex-1">
          {SERVICES.map((service) => (
            <article
              key={service.number}
              data-reveal
              className="flex w-full flex-col gap-4 border-b border-line pb-8 opacity-0"
            >
              <div className="flex w-full items-center gap-4">
                <p className="font-code whitespace-nowrap text-[12px] leading-[normal] text-sky">
                  {service.number}
                </p>
                <h3 className="min-w-px flex-1 font-body text-[24px] font-semibold leading-[1.2] text-white">
                  {service.title}
                </h3>
                <IconArrowUpRight />
              </div>
              <p className="font-body text-[16px] leading-[1.6] text-slate">
                {service.description}
              </p>
              <p className="font-code text-[11px] leading-[1.6] text-sky">
                {service.tags}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

