"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const bar = el;

    // Cache doc height — recompute only on resize, not every scroll tick.
    // Reading scrollHeight is a layout-forcing op; doing it per scroll frame
    // was needlessly triggering reflow.
    let docHeight = document.documentElement.scrollHeight - window.innerHeight;
    let lastRatio = -1;
    let lastOpacity = -1;

    function recomputeDoc() {
      docHeight = document.documentElement.scrollHeight - window.innerHeight;
    }

    const resizeObserver = new ResizeObserver(recomputeDoc);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("resize", recomputeDoc);

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
        const opacity = scrollTop > window.innerHeight * 0.8 ? 1 : 0;
        // Round to avoid redundant writes; transform is GPU-composited.
        const rounded = Math.round(ratio * 1000) / 1000;
        if (rounded !== lastRatio) {
          lastRatio = rounded;
          bar.style.transform = `scaleX(${rounded})`;
        }
        if (opacity !== lastOpacity) {
          lastOpacity = opacity;
          bar.style.opacity = String(opacity);
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recomputeDoc);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <div ref={barRef} id="scroll-progress" />;
}
