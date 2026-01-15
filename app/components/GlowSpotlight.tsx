"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GlowSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    if (!container || !spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(spotlight, {
        x: x - 300,
        y: y - 300,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    // Initial position centered
    gsap.set(spotlight, {
      x: window.innerWidth / 2 - 300,
      y: window.innerHeight / 2 - 300,
    });

    // Subtle floating animation when idle
    const floatAnimation = gsap.to(spotlight, {
      y: "+=30",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true,
    });

    let idleTimeout: ReturnType<typeof setTimeout>;

    const startIdle = () => {
      idleTimeout = setTimeout(() => {
        floatAnimation.play();
      }, 2000);
    };

    const stopIdle = () => {
      clearTimeout(idleTimeout);
      floatAnimation.pause();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousemove", stopIdle);
    container.addEventListener("mouseleave", startIdle);
    startIdle();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousemove", stopIdle);
      container.removeEventListener("mouseleave", startIdle);
      clearTimeout(idleTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a]" />
      
      {/* Spotlight glow */}
      <div
        ref={spotlightRef}
        className="absolute w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
