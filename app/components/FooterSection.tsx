"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Pie de página" — built 1:1 from the Figma file 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14461, 1440 × 399
 *       fondo #071226 · padding 80 (arriba) / 80 / 40 · gap 48 · identidad a la
 *       izquierda (540) y navegación a la derecha (440): dos columnas de 200
 *       con gap 40, cada enlace en una caja de 32 y gap 12 · aviso legal con
 *       hairline rgba(255,255,255,0.25) y `pt 24`
 *   · Mobile azul frame → node 4:14811, 390 × 609.52
 *       fondo #2463ff · padding 64 / 24 / 40 · apilado, gap 40 · aviso legal en
 *       columna, gap 20 entre copyright y enlaces
 *
 * El wordmark reusa Rubik One con `leading 0.9` y una altura fija por
 * breakpoint (77.52 / 108.53): Figma reserva la caja del texto más alta que las
 * dos líneas y eso mueve la descripción 24px más abajo, así que sin la altura
 * el pie de mobile medía 604 en vez de 609.52. En mobile además va sobre una
 * caja de 171.68 centrada —el trazado arranca en x=39, no en 24—, mientras que
 * en desktop la caja de 240.35 está alineada a la izquierda: centrarla sin más
 * corría el logo 20px a la derecha.
 *
 * La hairline del aviso va por dentro del marco (Figma), así que el `border-t`
 * de CSS se compensa con `pt-[23px]` para que el bloque mida 41 (DT) y 74 (MB).
 * El logo de `font-display` y el `leading` en px del copyright/enlaces siguen
 * el mismo criterio de líneas enteras que el resto de las secciones.
 */

const LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Plan integral", href: "#plan-integral" },
  { label: "Proceso", href: "#proceso" },
  { label: "Contacto", href: "#contacto" },
];

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Behance", href: "#" },
];

const LEGAL = [
  { label: "Privacidad", href: "#" },
  { label: "Términos y condiciones", href: "#" },
];

function IconArrowUpRight() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className="shrink-0 text-white"
      aria-hidden="true"
    >
      <path d="M9.9162 9.9162V4.0838H4.0838M9.9162 4.0838L4.0838 9.9162" />
    </svg>
  );
}

export default function FooterSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <footer
      ref={rootRef}
      className="relative z-10 bg-brand lg:bg-night"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 pt-16 pb-10 sm:px-10 lg:px-20 lg:pt-20">
        {/* Identidad y navegación */}
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Estudio */}
          <div className="flex w-full flex-col gap-6 lg:w-[540px] lg:shrink-0">
            <span
              data-reveal
              className="block h-[77.52px] w-[171.68px] text-center font-display text-[40px] leading-[0.9] text-white opacity-0 lg:h-[108.53px] lg:w-auto lg:text-left lg:text-[56px]"
            >
              Balrok
              <br />
              Studio
            </span>
            <p
              data-reveal
              className="font-body text-[16px] leading-[26px] text-white opacity-0"
            >
              Diseño con intención. Desarrollo con criterio.
              <br />
              Experiencias digitales a medida.
            </p>
          </div>

          {/* Navegación del pie */}
          <div className="flex w-full gap-10 lg:w-[440px]">
            <div className="flex min-w-px flex-1 flex-col gap-3">
              <p className="font-code text-[11px] leading-[14px] whitespace-nowrap text-sky">
                EXPLORAR
              </p>
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex h-8 items-start rounded-lg font-body text-[14px] leading-[normal] whitespace-nowrap text-white transition-colors hover:text-sky"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex min-w-px flex-1 flex-col gap-3">
              <p className="font-code text-[11px] leading-[14px] whitespace-nowrap text-sky">
                CONECTAR
              </p>
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center gap-2 transition-colors hover:text-sky"
                >
                  <span className="flex h-8 items-start rounded-lg font-body text-[14px] leading-[normal] whitespace-nowrap text-white">
                    {social.label}
                  </span>
                  <IconArrowUpRight />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Aviso legal */}
        <div className="flex w-full flex-col gap-5 border-t border-white/25 pt-[23px] lg:flex-row lg:items-start lg:justify-between">
          <p
            data-reveal
            className="font-body text-[11px] leading-[17px] text-white opacity-0"
          >
            © 2026 Balrok Studio. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {LEGAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-[11px] leading-[13px] whitespace-nowrap text-white transition-colors hover:text-sky"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

