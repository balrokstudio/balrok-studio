"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  stagger = 0.05,
  as: Component = "span",
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const chars = containerRef.current.querySelectorAll(".char");

    gsap.set(chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: stagger,
      delay: delay,
      ease: "back.out(1.7)",
    });
  }, [delay, stagger]);

  const letters = text.split("");

  return (
    <Component
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`${className} inline-block`}
      style={{ perspective: "1000px" }}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          className="char inline-block"
          style={{
            transformStyle: "preserve-3d",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Component>
  );
}
