"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  useAnimationFrame,
} from "framer-motion";

function WavesBackground() {
  const reduce = useReducedMotion();

  // Mouse-driven parallax
  const parallax = useMotionValue(0);
  const pxNear = useSpring(useTransform(parallax, (v) => v * 24), {
    stiffness: 60,
    damping: 20,
    mass: 0.6,
  });
  const pxMid = useSpring(useTransform(parallax, (v) => v * 16), {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
  });
  const pxFar = useSpring(useTransform(parallax, (v) => v * 8), {
    stiffness: 60,
    damping: 20,
    mass: 1.0,
  });

  // Slow hue rotation over time
  const hue = useMotionValue(0);
  useAnimationFrame((t) => {
    // t is ms since start; rotate ~20deg every 2s
    hue.set((t / 100) % 360);
  });
  const hueFilter = useTransform(hue, (h) => `hue-rotate(${Math.round(h / 10)}deg)`);

  // Mouse move handler on parent via pointer-events container sibling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const w = window.innerWidth || 1;
    const v = ((x / w) - 0.5) * 2; // -1..1
    parallax.set(v);
  };
{/*
  return (
     <div
      className="absolute inset-0 -z-10 overflow-hidden"
      // create a sibling overlay to capture mouse while not blocking UI
      aria-hidden
    >
   
      <div
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const w = window.innerWidth || 1;
          parallax.set(((t.clientX / w) - 0.5) * 2);
        }}
      />

      <motion.div style={{ filter: hueFilter }} className="pointer-events-none absolute inset-0">
    
        <svg
          className="absolute inset-x-0 -top-28 h-[55vh] w-[150%] -translate-x-[25%] opacity-35"
          viewBox="0 0 1440 320"
        >
          <motion.path
            d="M0,192L80,170.7C160,149,320,107,480,128C640,149,800,235,960,256C1120,277,1280,235,1360,213.3L1440,192L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            fill="url(#gradFar)"
            initial={reduce ? false : { y: 0 }}
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={reduce ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: pxFar }}
          />
          <defs>
            <linearGradient id="gradFar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>

       
        <svg
          className="absolute inset-x-0 top-[10vh] h-[60vh] w-[150%] -translate-x-[25%] opacity-45"
          viewBox="0 0 1440 320"
        >
          <motion.path
            d="M0,160L80,154.7C160,149,320,139,480,149.3C640,160,800,192,960,186.7C1120,181,1280,139,1360,117.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            fill="url(#gradMid)"
            initial={reduce ? false : { y: 0 }}
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={reduce ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: pxMid }}
          />
          <defs>
            <linearGradient id="gradMid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>

        
        <svg
          className="absolute inset-x-0 top-[28vh] h-[65vh] w-[160%] -translate-x-[30%] opacity-55 blur-[1px]"
          viewBox="0 0 1440 320"
        >
          <motion.path
            d="M0,224L80,229.3C160,235,320,245,480,234.7C640,224,800,192,960,181.3C1120,171,1280,181,1360,186.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            fill="url(#gradNear)"
            initial={reduce ? false : { y: 0 }}
            animate={reduce ? undefined : { y: [0, 18, 0] }}
            transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: pxNear }}
          />
          <defs>
            <linearGradient id="gradNear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div> 
  ); */}
}

export default function Home() {
  return (
    <div className="relative font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 overflow-hidden">
      
      <main className="flex flex-col gap-[24px] row-start-2 items-center">
        <Image
          className=""
          src="/balrok-studio-logo-claro.svg"
          alt="balrok studio logo"
          width={330}
          height={60}
          priority
        />
        <p className="text-balance text-center text-lg sm:text-xl leading-relaxed max-w-[330px] mx-auto">
          Diseño y desarrollo web a medida. Sitios rápidos, claros y listos para convertir.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-6 sm:w-auto"
            href="mailto:contacto@balrok.studio"
          >
            Contacto
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-6 w-full sm:w-auto md:w-[158px]"
            href="#redes"
          >
            Redes
          </a>
        </div>
      </main> 
    </div>
  );
}
