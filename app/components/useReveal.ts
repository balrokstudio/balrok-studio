"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * Entry animation shared by the page sections: tweens every `[data-reveal]`
 * descendant of `rootRef` from `opacity: 0 / y: 24` to its final state.
 *
 * On mount, not ScrollTrigger, on purpose: `scripts/measure.mjs` settles the
 * page by waiting until every `[data-reveal]` element reaches `opacity: 1` with
 * an identity transform (see its `SETTLE` probe). A scroll-driven reveal below
 * the fold never fires at scroll top, so the measurement would hit the 6s
 * timeout and fall back to forcing the final state. The hero (`HeroSection`)
 * already reveals on mount for the same reason.
 *
 * Elements must ship with `opacity-0` in their className so that the initial
 * frame matches the tween's `from` and nothing flashes before hydration.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tween = gsap.fromTo(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
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
  }, [rootRef]);
}
