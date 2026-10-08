"use client";

import { useRef } from "react";
import { useReveal } from "./useReveal";

/**
 * "Contacto de proyecto" — built 1:1 from the Figma file
 * 8MLojKHAFEE3rGYwgROC4h:
 *   · Desktop azul frame → node 4:14419, 1440 × 786
 *       fondo #071226 · padding 104 / 80 · fila con gap 104: invitación fija de
 *       472 + formulario que ocupa los 704 restantes · tarjeta bg #0d1e3a,
 *       1px #294467, radius 24, padding 32, gap 24 · campos de 52, textarea de
 *       110 (el bloque mide 152 y deja 18px libres, como en el diseño)
 *   · Mobile azul frame → node 4:14772, 390 × 1167
 *       padding 64 / 24 · apilado, gap 40 · tarjeta a ancho completo, padding
 *       24 · los dos campos de contacto se apilan · sin el círculo de estudio
 *
 * El formulario son controles reales (`input` / `textarea` / `checkbox`), no
 * divs con texto: los campos del diseño son un formulario y así funciona de
 * verdad. El borde entra en la caja (box-sizing) y la tarjeta vuelve a usar
 * `inset-ring` en vez de `border` porque su alto es automático: con borde CSS
 * mediría 580 y la sección 788 en lugar de 578 / 786. El envío usa el `mailto`
 * del estudio —no hay backend— igual que el resto de los CTA del sitio.
 *
 * Los `leading` van en px enteros (17 / 54 / 36 / 26 / 22) por el redondeo de
 * línea de Figma: con ellos la sección mide 786 (DT) y 1167 (MB) clavados.
 */

const FIELDS = [
  { label: "Tu nombre", placeholder: "¿Cómo te llamás?", type: "text" },
  { label: "Email de contacto", placeholder: "vos@tuempresa.com", type: "email" },
  { label: "Marca o negocio", placeholder: "Nombre de tu proyecto", type: "text" },
] as const;

function IconArrowUpRight({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

function TextField({
  label,
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-body text-[13px] leading-[16px] font-medium text-white">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-lg border border-line bg-transparent px-4 font-body text-[14px] leading-[normal] text-white placeholder:text-slate"
      />
    </label>
  );
}


export default function ContactSection() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section id="contacto" ref={rootRef} className="relative z-10 bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-start lg:gap-[104px] lg:px-20 lg:py-[104px]">
        {/* Invitación */}
        <div className="flex w-full flex-col gap-7 lg:w-[472px] lg:shrink-0">
          <div className="flex flex-col gap-5">
            <p
              data-reveal
              className="font-code text-[11px] leading-[17px] text-sky opacity-0"
            >
              07 / HABLEMOS DE TU IDEA
            </p>
            <h2
              data-reveal
              className="font-body text-[32px] leading-[36px] font-semibold text-white opacity-0 lg:text-[48px] lg:leading-[54px]"
            >
              Tu próxima web empieza con una conversación.
            </h2>
            <p
              data-reveal
              className="font-body text-[16px] leading-[26px] text-slate opacity-0"
            >
              Contanos qué querés construir. Te ayudamos a definir el camino, el
              alcance y los próximos pasos.
            </p>
          </div>

          <div data-reveal className="flex w-full items-start gap-3 opacity-0">
            <IconArrowUpRight />
            <p className="min-w-px flex-1 font-body text-[14px] leading-[22px] text-white">
              Revisamos tu consulta y coordinamos un primer brief.
            </p>
          </div>

          {/* Detalle de estudio — sólo en desktop, como en el diseño */}
          <div
            data-reveal
            className="hidden w-full flex-col gap-5 pt-10 opacity-0 lg:flex"
          >
            <div className="size-12 shrink-0 rounded-full bg-brand" />
            <p className="font-body text-[12px] leading-[18px] font-medium text-slate">
              Una idea clara es el mejor punto de partida.
            </p>
          </div>
        </div>

        {/* Formulario de proyecto */}
        <form
          data-reveal
          action="mailto:hola@balrokstudio.com"
          method="post"
          encType="text/plain"
          className="flex w-full flex-col gap-6 rounded-3xl bg-[#0d1e3a] p-6 inset-ring inset-ring-line opacity-0 lg:min-w-px lg:flex-1 lg:p-8"
        >
          <div className="flex w-full flex-col gap-4 lg:flex-row">
            {FIELDS.slice(0, 2).map((field) => (
              <div key={field.label} className="w-full lg:min-w-px lg:flex-1">
                <TextField {...field} />
              </div>
            ))}
          </div>

          <TextField {...FIELDS[2]} />

          <label className="flex h-[152px] w-full flex-col gap-2">
            <span className="font-body text-[13px] leading-[16px] font-medium text-white">
              ¿Qué te gustaría construir?
            </span>
            <textarea
              placeholder="Tu idea, tus objetivos o el sitio que querés mejorar…"
              className="h-[110px] w-full resize-none rounded-lg border border-line bg-transparent px-4 py-4 font-body text-[14px] leading-[normal] text-white placeholder:text-slate"
            />
          </label>

          <label className="flex w-full items-center gap-3">
            <input
              type="checkbox"
              className="size-5 shrink-0 appearance-none rounded border border-brand bg-transparent checked:bg-brand"
            />
            <span className="min-w-px flex-1 font-body text-[13px] leading-[16px] text-slate">
              Acepto la política de privacidad y el uso de mis datos para esta
              consulta.
            </span>
          </label>

          <button
            type="submit"
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-brand px-5 shadow-[0px_4px_24px_0px_rgba(36,99,255,0.25)] transition-transform hover:-translate-y-0.5"
          >
            <span className="font-body text-[14px] font-semibold leading-[normal] whitespace-nowrap text-white">
              Enviar mi proyecto
            </span>
            <IconArrowUpRight size={18} />
          </button>

          <p className="font-body text-[12px] leading-[18px] font-medium text-slate">
            Usamos tus datos únicamente para responder a tu consulta.
          </p>
        </form>
      </div>
    </section>
  );
}
