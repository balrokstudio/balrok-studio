"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import HeroConceptCard from "./HeroConceptCard";

/**
 * Hero / first section of the Balrok Studio site, built 1:1 from the Figma
 * "Inicio" frame (file 8MLojKHAFEE3rGYwgROC4h · node 4:14123).
 *
 * Desktop reference is a 1440 × 912 frame:
 *   · Navegación     (4:14124) 1440 × 120, px 80, hairline bottom border
 *   · Presentación   (4:14138) 1440 × 728, padding 88 / 80 / 80 / 80, gap 56
 *       – Promesa principal (4:14139) 792 wide, gap 28
 *       – Concepto de interfaz (4:14154) 432 wide  → HeroConceptCard
 *   · Especialidades (4:14193) 1440 × 64, px 80, hairline top + bottom border
 */

const NAV_LINKS = [
  // The fixed widths reproduce the 496px Figma navigation group exactly.
  { label: "Servicios", href: "#servicios", width: "xl:w-20" },
  { label: "Plan integral", href: "#plan-integral", width: "xl:w-28" },
  { label: "Proceso", href: "#proceso", width: "xl:w-16" },
];

const SPECIALTIES = [
  "UI/UX a medida",
  "Desarrollo web",
  "Infraestructura y soporte",
];

function IconArrowUpRight() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveal = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const tween = gsap.fromTo(
      reveal,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.1,
        stagger: 0.08,
        ease: "power2.out",
      }
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative z-10 flex min-h-screen w-full flex-col bg-background font-body"
    >
      {/* Navegación */}
      <header className="h-[120px] w-full shrink-0 border-b border-line">
        <nav className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-20">
          <span
            data-reveal
            className="block w-[163.1px] shrink-0 text-center font-display text-[38px] leading-[34.2px] text-white opacity-0 select-none"
          >
            Balrok
            <br />
            Studio
          </span>

          <div data-reveal className="flex items-center gap-8 opacity-0">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`${link.width} hidden text-[14px] leading-[16.94px] text-white transition-colors hover:text-sky sm:block`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:contacto@balrokstudio.com"
              className="flex h-[52px] w-[144px] shrink-0 items-center justify-center rounded-lg border border-sky text-[14px] font-semibold leading-[16.94px] text-white transition-colors hover:bg-white/5"
            >
              Hablemos
            </a>
          </div>
        </nav>
      </header>

      {/* Presentación */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:gap-14 lg:px-20 lg:pt-[88px] lg:pb-20">
        {/* Promesa principal */}
        <div className="flex w-full max-w-[792px] flex-col gap-7">
          <p
            data-reveal
            className="font-code text-[11px] leading-[16.5px] text-sky opacity-0"
          >
            ESTUDIO DIGITAL INDEPENDIENTE
          </p>

          <h1
            data-reveal
            className="hero-title font-body font-semibold leading-[1.06] text-white opacity-0"
          >
            <span>{"Diseño y desarrollo web "}</span>
            <span>{"a medida. Sitios rápidos, "}</span>
            <span>{"claros y listos para "}</span>
            <span className="text-sky">{"convertir."}</span>
          </h1>

          <p
            data-reveal
            className="font-body text-[16px] leading-[25.6px] text-slate opacity-0"
          >
            Transformamos tus ideas en experiencias digitales de alto
            rendimiento. Diseño UI/UX y desarrollo a medida, conectados desde el
            primer día.
          </p>

          {/* Acciones */}
          <div data-reveal className="flex flex-col gap-3 opacity-0 sm:flex-row">
            <a
              href="mailto:contacto@balrokstudio.com"
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-brand text-[14px] font-semibold leading-[16.94px] text-white shadow-[0_4px_24px_rgba(36,99,255,0.25)] transition-[background-color,box-shadow] hover:bg-[#3d74ff] hover:shadow-[0_6px_32px_rgba(36,99,255,0.4)] sm:w-[232px]"
            >
              Empezar mi proyecto
              <IconArrowUpRight />
            </a>
            <a
              href="#plan-integral"
              className="flex h-[52px] w-full items-center justify-center rounded-lg border border-sky text-[14px] font-semibold leading-[16.94px] text-white transition-colors hover:bg-white/5 sm:w-[144px]"
            >
              Ver planes
            </a>
          </div>

          <p
            data-reveal
            className="font-body text-[12px] font-medium leading-[18px] text-slate opacity-0"
          >
            Diseño con intención. Tecnología sin complicaciones.
          </p>
        </div>

        {/* Concepto de interfaz */}
        <div
          data-reveal
          className="flex w-full shrink-0 justify-center opacity-0 max-xs:h-[404px] lg:w-[432px]"
        >
          <div className="w-[432px] shrink-0 origin-top max-xs:scale-[0.72]">
            <HeroConceptCard />
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="w-full shrink-0 border-t border-line lg:h-16">
        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 sm:px-10 lg:flex-nowrap lg:justify-between lg:gap-4 lg:px-20 lg:py-0">
          {SPECIALTIES.map((specialty) => (
            <div
              key={specialty}
              data-reveal
              className="flex items-center gap-2.5 opacity-0"
            >
              <IconPlus className="shrink-0 text-sky" />
              <span className="whitespace-nowrap text-[13px] leading-[15.73px] text-slate">
                {specialty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
