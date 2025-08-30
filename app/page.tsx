"use client";

// Removed animated background and unused imports

export default function Home() {
  return (
    <div className="relative font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 overflow-hidden">
      
      <main className="flex flex-col gap-[24px] row-start-2 items-center">
        <h1
          className="font-sans font-black tracking-tight text-[62px] sm:text-[75px] leading-none select-none text-center"
          aria-label="Balrok Studio"
        >
          <span className="block">Balrok</span>
          <span className="block">Studio</span>
        </h1>
        <p className="text-balance text-center text-lg sm:text-xl leading-relaxed max-w-[370px] mx-auto font-light">
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
