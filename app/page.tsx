"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import GlowSpotlight from "./components/GlowSpotlight";
import AnimatedText from "./components/AnimatedText";
import ServicesSection from "./components/ServicesSection";
import ProcessSection from "./components/ProcessSection";

export default function Home() {
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate subtitle
    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.0, ease: "power2.out" }
      );
    }

    // Animate buttons
    if (buttonsRef.current) {
      const buttons = buttonsRef.current.querySelectorAll("a");
      gsap.fromTo(
        buttons,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 1.3,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <div className="relative font-sans min-h-screen overflow-x-hidden">
      {/* Subtle Background with Spotlight */}
      <GlowSpotlight />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Animated Title */}
          <h1
            className="font-black tracking-tight text-[48px] sm:text-[72px] md:text-[88px] leading-[0.95] select-none mb-8"
            aria-label="Balrok Studio"
          >
            <span className="block">
              <AnimatedText text="Balrok" delay={0.2} stagger={0.06} />
            </span>
            <span className="block">
              <AnimatedText text="Studio" delay={0.6} stagger={0.06} />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg sm:text-xl leading-relaxed max-w-md mx-auto text-gray-300 mb-12 opacity-0"
          >
            Diseño y desarrollo web a medida. Sitios rápidos, claros y listos para convertir.
          </p>

          {/* CTA Buttons */}
          <div
            ref={buttonsRef}
            className="flex gap-4 items-center justify-center flex-col sm:flex-row"
          >
            <a
              className="btn-primary rounded-full font-medium text-sm h-12 px-8 flex items-center justify-center"
              href="mailto:contacto@balrokstudio.com"
            >
              Empezar proyecto
            </a>
            <a
              className="btn-secondary rounded-full font-medium text-sm h-12 px-8 flex items-center justify-center"
              href="#servicios"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-0.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Process Section */}
      <ProcessSection />

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
            ¿Listo para empezar?
          </h2>
          <p className="text-muted text-lg mb-10">
            Contanos sobre tu proyecto y te respondemos en menos de 24 horas.
          </p>
          <a
            className="btn-primary rounded-full font-medium text-sm h-12 px-10 inline-flex items-center justify-center"
            href="mailto:contacto@balrokstudio.com"
          >
            Hablemos
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-muted text-sm">
            © 2025 Balrok Studio
          </p>
          <div className="flex gap-8">
            <a
              href="mailto:contacto@balrokstudio.com"
              className="footer-link text-muted hover:text-white transition-colors text-sm"
            >
              contacto@balrokstudio.com
            </a>
            <a
              href="#"
              className="footer-link text-muted hover:text-white transition-colors text-sm"
            >
              Instagram
            </a>
            <a
              href="#"
              className="footer-link text-muted hover:text-white transition-colors text-sm"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
