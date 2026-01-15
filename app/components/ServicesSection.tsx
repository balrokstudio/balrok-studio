"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: "01",
    title: "Diseño Web",
    description:
      "Interfaces únicas que conectan con tu audiencia. Diseño UI/UX centrado en conversión.",
  },
  {
    number: "02",
    title: "Desarrollo",
    description:
      "Código limpio y escalable. React, Next.js, y las mejores tecnologías del momento.",
  },
  {
    number: "03",
    title: "Optimización",
    description:
      "SEO técnico, velocidad de carga y performance. Tu sitio rápido y encontrable.",
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = cardsRef.current.filter(Boolean);

    gsap.set(cards, {
      opacity: 0,
      y: 60,
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
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
      id="servicios"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-muted text-sm tracking-widest uppercase mb-4">
          Servicios
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-16 tracking-tight max-w-lg">
          Todo lo que necesitás para destacar online.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="service-card group"
            >
              <div className="service-card-inner p-8 rounded-xl h-full">
                <span className="text-5xl font-black text-white/10 block mb-6 group-hover:text-white/20 transition-colors">
                  {service.number}
                </span>
                <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                <p className="text-muted leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
