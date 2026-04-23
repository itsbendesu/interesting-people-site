"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HeroParallax({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const parked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (!el) return;
        const y = window.scrollY;
        // Past the hero, park: stop writing transform/opacity every frame and
        // release the compositor layer so the rest of the page can scroll
        // without this layer fighting for time.
        if (y > window.innerHeight * 1.2) {
          if (!parked.current) {
            el.style.opacity = "0";
            el.style.willChange = "auto";
            parked.current = true;
          }
          return;
        }
        if (parked.current) {
          parked.current = false;
          el.style.willChange = "transform, opacity";
        }
        el.style.transform = `translate3d(0, ${y * -0.15}px, 0)`;
        el.style.opacity = `${Math.max(0, 1 - y / 700)}`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
