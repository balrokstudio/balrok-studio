"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Beneficios" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14203, 1440 × 627
 *       padding 104 / 80, gap 48 · header gap 20 · cards row 1280 × 280, gap 24
 *   · Mobile azul frame → node 4:14557, 390 × 1295
 *       padding 64 / 24, gap 32 · header gap 20 · cards stacked, gap 16
 *
 * Both breakpoints share the same card recipe: white surface, 1px #ced9ed
 * stroke, 16px radius, 24px padding, 24px inner gap, 48px icon tile.
 * The stroke is painted with `inset-ring` (a box-shadow) instead of `border`
 * on purpose: a CSS border adds 2px to every auto-height card, while Figma
 * draws the stroke inside the frame, so a border would grow the stacked
 * mobile column by 2px × 4 cards.
 * The eyebrow copy is genuinely different per breakpoint in the design
 * ("01 / POR QUÉ BALROK" on mobile, "… BALROK STUDIO" on desktop).
 *
 * Los `leading` van en px enteros por el redondeo de línea de Figma: cada
 * tarjeta es altura automática y mobile apila cuatro, así que el 0.2/0.4 de
 * más por línea de Figma se convierte en 6px de sección (1288.88 en vez de
 * 1295). Con los valores del diseño, 627 (DT) y 1295 (MB) clavados.
 */

const BENEFITS = [
  {
    Icon: IconBolt,
    title: "Velocidad que se siente",
    description:
      "Carga ágil, recursos optimizados y una experiencia fluida en cada dispositivo.",
  },
  {
    Icon: IconFocus,
    title: "Claridad visual",
    description:
      "Jerarquías claras y navegación intuitiva para encontrar lo importante sin esfuerzo.",
  },
  {
    Icon: IconCode,
    title: "Código limpio",
    description:
      "Una base sólida, mantenible y preparada para acompañar la evolución de tu negocio.",
  },
  {
    Icon: IconCursor,
    title: "Foco en convertir",
    description:
      "Mensajes y acciones diseñados para transformar el interés en consultas reales.",
  },
];

function IconBolt() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3.46591 13.8471C3.62617 13.9477 3.81168 14.0008 4.0009 14.0001H11.0001C11.1618 13.9996 11.3213 14.0383 11.4648 14.113C11.6083 14.1876 11.7315 14.296 11.8239 14.4287C11.9163 14.5615 11.9752 14.7147 11.9954 14.8752C12.0156 15.0357 11.9966 15.1987 11.94 15.3502L10.0202 21.3706C9.99015 21.4799 9.99814 21.5963 10.0429 21.7005C10.0876 21.8047 10.1665 21.8906 10.2665 21.9441C10.3665 21.9976 10.4817 22.0155 10.5932 21.9949C10.7047 21.9742 10.8059 21.9163 10.8801 21.8306L20.779 11.63C20.8982 11.483 20.9733 11.3052 20.9955 11.1173C21.0177 10.9294 20.9861 10.739 20.9045 10.5683C20.8228 10.3976 20.6943 10.2535 20.5341 10.1529C20.3738 10.0523 20.1883 9.99924 19.9991 9.99988H12.9999C12.8382 10.0004 12.6787 9.96169 12.5352 9.88703C12.3917 9.81239 12.2685 9.70404 12.1761 9.57128C12.0837 9.43853 12.0248 9.28533 12.0046 9.12484C11.9844 8.96434 12.0034 8.80133 12.06 8.6498L13.9798 2.62944C14.0099 2.52008 14.0019 2.40375 13.9571 2.29953C13.9124 2.19531 13.8335 2.10941 13.7335 2.05591C13.6335 2.00242 13.5183 1.98451 13.4068 2.00514C13.2953 2.02576 13.1941 2.08369 13.1199 2.16941L3.22099 12.37C3.10178 12.517 3.02671 12.6948 3.00451 12.8827C2.98231 13.0707 3.01387 13.261 3.09555 13.4317C3.17722 13.6025 3.30565 13.7465 3.46591 13.8471Z" />
    </svg>
  );
}

function IconFocus() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H7M17 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7M21 17V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H17M7 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V17M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM18.944 12.33C19.0187 12.1164 19.0187 11.8837 18.944 11.67C18.381 10.2905 17.4198 9.10985 16.1831 8.27879C14.9463 7.44774 13.4901 7.00391 12 7.00391C10.51 7.00391 9.05372 7.44774 7.81696 8.27879C6.58021 9.10985 5.61903 10.2905 5.05602 11.67C4.98133 11.8837 4.98133 12.1164 5.05602 12.33C5.61903 13.7096 6.58021 14.8902 7.81696 15.7213C9.05372 16.5523 10.51 16.9962 12 16.9962C13.4901 16.9962 14.9463 16.5523 16.1831 15.7213C17.4198 14.8902 18.381 13.7096 18.944 12.33Z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18.0005 15.9996L22.0008 12L18.0005 8.0004M5.99952 8.0004L1.9992 12L5.99952 15.9996M14.5002 4.0008L9.4998 19.9992" />
    </svg>
  );
}

function IconCursor() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4.00475 4.39836C3.98617 4.49588 3.99734 4.59672 4.03681 4.68781L10.5368 20.6878C10.5764 20.7851 10.6457 20.8674 10.7348 20.9231C10.8239 20.9788 10.9282 21.005 11.033 20.9981C11.1379 20.9911 11.2378 20.9513 11.3187 20.8843C11.3997 20.8173 11.4574 20.7265 11.4838 20.6248L13.0628 14.4988C13.1525 14.153 13.3332 13.8375 13.586 13.5851C13.8389 13.3328 14.1548 13.1528 14.5008 13.0638L20.6248 11.4838C20.7265 11.4574 20.8173 11.3997 20.8843 11.3187C20.9513 11.2378 20.9911 11.1379 20.9981 11.033C21.005 10.9282 20.9788 10.8239 20.9231 10.7348C20.8674 10.6457 20.7851 10.5764 20.6878 10.5368L4.68781 4.03681C4.59672 3.99734 4.49588 3.98617 4.39836 4.00475C4.30085 4.02332 4.21117 4.07079 4.14098 4.14098C4.07079 4.21117 4.02332 4.30085 4.00475 4.39836Z" />
    </svg>
  );
}

export default function BenefitsSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="beneficios" ref={rootRef} className="relative z-10 bg-mist">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-16 sm:px-10 lg:gap-12 lg:px-20 lg:py-[104px]">
        {/* Encabezado de sección */}
        <div className="flex flex-col gap-5">
          <p
            data-reveal
            className="font-code text-[11px] leading-[17px] text-brand opacity-0"
          >
            <span className="lg:hidden">01 / POR QUÉ BALROK</span>
            <span className="hidden lg:inline">
              01 / POR QUÉ BALROK STUDIO
            </span>
          </p>
          <h2
            data-reveal
            className="font-body text-[32px] leading-[36px] font-semibold text-ink opacity-0 lg:text-[48px] lg:leading-[54px]"
          >
            No solo se ve bien. Funciona mejor.
          </h2>
        </div>

        {/* Beneficios */}
        <div className="flex flex-col gap-4 lg:grid lg:h-[280px] lg:grid-cols-4 lg:gap-6">
          {BENEFITS.map(({ Icon, title, description }) => (
            <article
              key={title}
              data-reveal
              className="flex flex-col gap-6 rounded-2xl bg-white inset-ring inset-ring-haze p-6 opacity-0"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mist text-brand">
                <Icon />
              </div>
              <h3 className="font-body text-[24px] leading-[29px] font-semibold text-ink">
                {title}
              </h3>
              <p className="font-body text-[16px] leading-[26px] text-steel">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
