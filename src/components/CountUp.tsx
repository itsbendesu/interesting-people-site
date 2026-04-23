"use client";

import { useRef, useEffect } from "react";

export default function CountUp({
  target,
  duration = 1500,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Seed with final value so SSR matches and the number is correct before
    // the observer fires. We'll animate back down to 0 and up again on view.
    el.textContent = `0${suffix}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          // Write directly to the DOM — no React re-render per frame.
          el.textContent = `${Math.round(eased * target)}${suffix}`;
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}
