"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

// Single shared observer across every FadeIn on the page. Creating one per
// instance (47+ on the homepage) was measurably slowing down scroll.
let sharedObserver: IntersectionObserver | null = null;
const pending = new Map<Element, () => void>();

function getObserver() {
  if (sharedObserver) return sharedObserver;
  if (typeof window === "undefined") return null;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = pending.get(entry.target);
          if (cb) {
            cb();
            pending.delete(entry.target);
            sharedObserver!.unobserve(entry.target);
          }
        }
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  return sharedObserver;
}

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = getObserver();
    if (!observer) {
      setVisible(true);
      return;
    }
    pending.set(el, () => setVisible(true));
    observer.observe(el);
    return () => {
      pending.delete(el);
      observer.unobserve(el);
    };
  }, []);

  const transforms: Record<string, string> = {
    up: "translate3d(0, 20px, 0)",
    left: "translate3d(-20px, 0, 0)",
    right: "translate3d(20px, 0, 0)",
    none: "translate3d(0, 0, 0)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0, 0, 0)" : transforms[direction],
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
