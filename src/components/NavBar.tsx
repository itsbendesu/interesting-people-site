"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "#people", label: "People" },
  { href: "#about", label: "About" },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rafId = useRef<number>(0);
  const lastScrolled = useRef(false);

  useEffect(() => {
    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        // Hysteresis: enter at 80, exit at 60. Prevents re-render thrash
        // when the user parks the scroll right around the threshold.
        const next = lastScrolled.current ? y > 60 : y > 80;
        if (next !== lastScrolled.current) {
          lastScrolled.current = next;
          setScrolled(next);
        }
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Lock body scroll while the mobile menu drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  // Close on escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // When the drawer is open, treat the bar like its scrolled state for contrast.
  const showLight = scrolled || menuOpen;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          showLight
            ? "bg-white/95 border-b border-stone-100"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-1 font-bold text-base sm:text-lg tracking-tight transition-colors duration-300 shrink-0 ${
              showLight ? "text-stone-900" : "text-white"
            }`}
          >
            <span className="whitespace-nowrap">Interesting People</span>
            <sup
              className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${
                showLight ? "text-blue-600" : "text-blue-400"
              }`}
            >
              4
            </sup>
          </Link>

          <div className="flex items-center gap-2 sm:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden md:block text-sm transition-colors duration-300 ${
                  scrolled
                    ? "text-stone-500 hover:text-stone-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/apply"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 py-2 sm:py-3 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition-all whitespace-nowrap"
            >
              Apply Now
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className={`md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-300 ${
                showLight
                  ? "text-stone-900 hover:bg-stone-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="7" x2="21" y2="7" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm cursor-default"
        />
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-stone-100 shadow-lg transform transition-transform duration-200 ease-out ${
            menuOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <nav className="px-4 sm:px-6 py-4 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center min-h-[48px] text-base text-stone-700 hover:text-stone-900 border-b border-stone-100 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
