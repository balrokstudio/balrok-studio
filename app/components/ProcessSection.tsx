"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { number: "01", title: "Descubrimiento", desc: "Entendemos tu negocio, audiencia y objetivos" },
  { number: "02", title: "Diseño", desc: "Creamos la propuesta visual y wireframes" },
  { number: "03", title: "Desarrollo", desc: "Construimos con código limpio y moderno" },
  { number: "04", title: "Entrega", desc: "Lanzamos, optimizamos y te acompañamos" },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const stepElements = stepsRef.current.filter(Boolean);

    gsap.set(stepElements, { opacity: 0, x: -30 });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 70%",
      onEnter: () => {
        gsap.to(stepElements, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-32 px-8"
      id="proceso"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-muted text-sm tracking-widest uppercase mb-4">
          Proceso
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-16 tracking-tight max-w-lg">
          Cómo trabajamos juntos.
        </h2>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => {
                if (el) stepsRef.current[index] = el;
              }}
              className="flex items-start gap-6 group"
            >
              {/* Number */}
              <div className="step-marker flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <div className="pt-3 border-b border-subtle pb-6 flex-1">
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
