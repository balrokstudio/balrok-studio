"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Preguntas frecuentes" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14380, 1440 × 839
 *       fondo #f2f6ff · padding 104 / 80 · gap 104: intro fija de 408 +
 *       preguntas que ocupan los 768 restantes · cada pregunta 16px semibold +
 *       ícono 18px, respuesta gap 12, y una hairline inferior #ced9ed
 *   · Mobile azul frame → node 4:14733, 390 × 1253
 *       padding 64 / 24 · apilado, gap 40 · título 32px
 *
 * La hairline de cada pregunta en Figma va por dentro del marco, así que el
 * `border-b` de CSS va con `pb-[23px]` (23 + 1 = los 24px que mide el diseño) y
 * la fila sigue midiendo 107 en vez de 108. Los `leading` de pregunta (19px),
 * respuesta (26px) y bloque de intro van en px enteros porque Figma redondea
 * cada caja de línea: con eso la sección mide 839 (DT) y 1253 (MB) clavados.
 *
 * Las respuestas llevan `tracking-[-0.005em]` a propósito. Inter mide en el
 * navegador ~1.5% más ancho que en el archivo —medido sobre el render: en 1440
 * la misma primera línea mide 716px contra 712—, y en mobile el corte de «…
 * un mail corporativo,» cae justo en el borde: sin ese ajuste la respuesta
 * ocupa 343px en vez de 338 y gana una línea (la sección crecía 52px, 1305
 * contra 1253, y con él se corría todo lo que sigue).
 */

const FAQS = [
  {
    question: "¿Qué incluye el plan integral?",
    answer:
      "Incluye dominio, hosting, un mail corporativo, SEO inicial y mantenimiento continuo. El diseño y desarrollo se organizan según el alcance que acordemos para tu sitio.",
  },
  {
    question: "¿Cuánto tarda en estar lista mi web?",
    answer:
      "El plazo depende del alcance y del contenido disponible. Después del brief definimos las etapas y un calendario de trabajo para tu proyecto.",
  },
  {
    question: "¿Necesito tener textos e imágenes?",
    answer:
      "Podés traer tu contenido o trabajar con nosotros en su estructura. En el brief definimos qué materiales necesitamos para avanzar.",
  },
  {
    question: "¿Puedo sumar funcionalidades más adelante?",
    answer:
      "Sí. Evaluamos nuevas necesidades e integraciones para que tu web pueda evolucionar. Cada ampliación se acuerda antes de desarrollarla.",
  },
  {
    question: "¿Qué sucede después del lanzamiento?",
    answer:
      "Seguimos acompañándote con mantenimiento y soporte técnico continuo. Tu sitio no queda solo después de publicarlo.",
  },
];

function IconPlus() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-brand"
      aria-hidden="true"
    >
      <path d="M3.7494 9H14.2506M9 3.7494V14.2506" />
    </svg>
  );
}

export default function FaqSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="faq" ref={rootRef} className="relative z-10 bg-mist">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-start lg:gap-[104px] lg:px-20 lg:py-[104px]">
        {/* Introducción */}
        <div className="flex w-full flex-col gap-6 lg:w-[408px] lg:shrink-0">
          <div className="flex flex-col gap-5">
            <p
              data-reveal
              className="font-code text-[11px] leading-[17px] text-brand opacity-0"
            >
              06 / PREGUNTAS FRECUENTES
            </p>
            <h2
              data-reveal
              className="font-body text-[32px] leading-[36px] font-semibold text-ink opacity-0 lg:text-[48px] lg:leading-[54px]"
            >
              Antes de dar el primer paso.
            </h2>
            <p
              data-reveal
              className="font-body text-[16px] leading-[26px] text-steel opacity-0"
            >
              Lo esencial para comenzar con claridad.
            </p>
          </div>
          <p
            data-reveal
            className="font-body text-[14px] leading-[22px] text-brand opacity-0"
          >
            ¿Otra pregunta? Contanos en el formulario.
          </p>
        </div>

        {/* Preguntas y respuestas */}
        <div className="flex w-full flex-col gap-6 lg:min-w-px lg:flex-1">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              data-reveal
              className="flex w-full flex-col gap-3 border-b border-haze pb-[23px] opacity-0"
            >
              <div className="flex w-full items-start gap-4">
                <h3 className="min-w-px flex-1 font-body text-[16px] leading-[19px] font-semibold text-ink">
                  {faq.question}
                </h3>
                <IconPlus />
              </div>
              <p className="font-body text-[16px] leading-[26px] tracking-[-0.005em] text-steel">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


