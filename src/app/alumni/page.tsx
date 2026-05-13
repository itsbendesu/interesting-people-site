"use client";

import Link from "next/link";
import { useState } from "react";

const ALUMNI_PRICE = 6999;
const ALUMNI_FRIEND_PRICE = 7999;
const REGULAR_PRICE = 8999;

type TicketType = "alumni" | "alumni-friend";
type PriorEvent = "IP3" | "IP2" | "IP1";
type Step = "pricing" | "form" | "submitted";

function formatPrice(amount: number) {
  return "$" + amount.toLocaleString("en-US");
}

export default function AlumniPage() {
  const [step, setStep] = useState<Step>("pricing");
  const [ticketType, setTicketType] = useState<TicketType>("alumni");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    teachSkill: "",
    priorEvent: "IP3" as PriorEvent,
    referredBy: "",
    socials: { instagram: "", x: "", tiktok: "", youtube: "", linkedin: "", website: "" },
  });

  const normalizeSocialUrl = (platform: string, value: string): string => {
    const v = value.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (v.includes(".")) return `https://${v}`;
    const handle = v.replace(/^@/, "");
    const bases: Record<string, string> = {
      instagram: `https://instagram.com/${handle}`,
      x: `https://x.com/${handle}`,
      tiktok: `https://tiktok.com/@${handle}`,
      youtube: `https://youtube.com/@${handle}`,
      linkedin: `https://linkedin.com/in/${handle}`,
      website: `https://${v}`,
    };
    return bases[platform] || `https://${v}`;
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = ticketType === "alumni" ? ALUMNI_PRICE : ALUMNI_FRIEND_PRICE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/apply/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          bio: form.bio,
          teachSkill: form.teachSkill || undefined,
          links: Object.entries(form.socials)
            .filter(([, v]) => v.trim())
            .map(([platform, value]) => normalizeSocialUrl(platform, value)),
          ticketType,
          priorEvent: ticketType === "alumni" ? form.priorEvent : undefined,
          referredBy: ticketType === "alumni-friend" ? form.referredBy || undefined : undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setStep("submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 font-bold text-base sm:text-lg text-stone-900 tracking-tight min-h-[44px]"
          >
            Interesting People
            <sup className="text-blue-600 text-sm font-bold">4</sup>
          </Link>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="hidden md:block text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {step !== "submitted" && (
        <section className="pt-24 pb-10 sm:pt-32 sm:pb-12 md:pt-40 md:pb-16">
          <div className="max-w-3xl mx-auto px-5 sm:px-6">
            <p className="text-xs sm:text-sm font-medium tracking-[0.15em] text-blue-600 uppercase mb-3 sm:mb-4">
              For IP Alumni
            </p>
            <h1 className="text-[2.25rem] leading-[1.1] sm:text-4xl md:text-6xl font-bold text-stone-900 tracking-tight mb-5 sm:mb-6">
              We&apos;d be bummed if you weren&apos;t there.
            </h1>
            <div className="text-base sm:text-lg md:text-xl text-stone-600 leading-relaxed space-y-4">
              <p>
                You&apos;ve been before. You know what this is.
                Regular tickets are <span className="font-semibold text-stone-900">{formatPrice(REGULAR_PRICE)}</span>{" "}
                — but if you&apos;re reading this, we noticed you hadn&apos;t applied yet,
                and we&apos;d love to fix that.
              </p>
              <p>
                Here&apos;s a rate for you. And one you can pass along to someone
                who&apos;d make next year better for everyone.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className={`pb-16 sm:pb-24 md:pb-32 ${step === "submitted" ? "pt-24 sm:pt-32 md:pt-40" : ""}`}>
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          {/* ── STEP: PRICING ── */}
          {step === "pricing" && (
            <>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Alumni card */}
                <button
                  onClick={() => setTicketType("alumni")}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                    ticketType === "alumni"
                      ? "border-blue-600 bg-blue-50 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {ticketType === "alumni" && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <p className="text-xs font-bold tracking-[0.15em] text-blue-600 uppercase mb-2">
                    For you
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-stone-900 tabular-nums mb-1">
                    {formatPrice(ALUMNI_PRICE)}
                  </p>
                  <p className="text-xs text-stone-500 mb-3">
                    <span className="line-through">{formatPrice(REGULAR_PRICE)}</span>{" "}
                    regular &middot; save {formatPrice(REGULAR_PRICE - ALUMNI_PRICE)}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Alumni rate. Everything regular gets — three days, all meals,
                    every activity, and 3 nights at a 5-star hotel.
                  </p>
                </button>

                {/* Friend card */}
                <button
                  onClick={() => setTicketType("alumni-friend")}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                    ticketType === "alumni-friend"
                      ? "border-blue-600 bg-blue-50 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {ticketType === "alumni-friend" && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <p className="text-xs font-bold tracking-[0.15em] text-stone-500 uppercase mb-2">
                    Pass it on
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-stone-900 tabular-nums mb-1">
                    {formatPrice(ALUMNI_FRIEND_PRICE)}
                  </p>
                  <p className="text-xs text-stone-500 mb-3">
                    For someone you&apos;d vouch for
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Same room, same meals, same everything. Bring someone who
                    belongs in the room — they get the alumni-adjacent price.
                  </p>
                </button>
              </div>

              <button
                onClick={() => setStep("form")}
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue — {formatPrice(price)}
              </button>
              <p className="text-xs text-stone-400 text-center mt-3">
                Short form next. No video. Payment after we confirm.
              </p>

              {/* Victoria locals note */}
              <p className="text-xs text-stone-400 text-center mt-8">
                Victoria local?{" "}
                <Link href="/apply" className="text-blue-600 hover:text-blue-700 underline">
                  The local rate is $5,999 — apply here instead.
                </Link>
              </p>

              {/* What's included */}
              <div className="mt-10 bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8">
                <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-4">
                  What&apos;s included
                </p>
                <ul className="space-y-3">
                  {[
                    "All sessions, workshops & activities",
                    "All food, drinks & transportation for 3 days",
                    "Comedy night, storytelling, magic",
                    "Curated dinner groups (skip the small talk)",
                    "Lake swims, late-night conversations, new friendships",
                    "3 nights at a 5-star hotel",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-stone-600">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ── STEP: FORM ── */}
          {step === "form" && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    {ticketType === "alumni" ? "Alumni rate" : "Pass-it-on rate"}
                  </p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">
                    {formatPrice(price)}
                  </p>
                </div>
                <button
                  onClick={() => setStep("pricing")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-8 shadow-sm">
                <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-2">
                  Almost there
                </p>
                <p className="text-sm text-stone-500 mb-8">
                  Just the basics so we know who&apos;s coming.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="alumni-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Name
                    </label>
                    <input
                      id="alumni-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="alumni-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="alumni-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="alumni-phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="alumni-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  {ticketType === "alumni" && (
                    <div>
                      <label htmlFor="alumni-prior" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Which IP did you come to?
                      </label>
                      <select
                        id="alumni-prior"
                        value={form.priorEvent}
                        onChange={(e) => setForm((f) => ({ ...f, priorEvent: e.target.value as PriorEvent }))}
                        className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="IP3">IP3 (2025)</option>
                        <option value="IP2">IP2 (2024)</option>
                        <option value="IP1">IP1 (2023)</option>
                      </select>
                    </div>
                  )}

                  {ticketType === "alumni-friend" && (
                    <div>
                      <label htmlFor="alumni-referred" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Who told you about this?{" "}
                        <span className="text-stone-400 font-normal">(an IP alum)</span>
                      </label>
                      <input
                        id="alumni-referred"
                        type="text"
                        value={form.referredBy}
                        onChange={(e) => setForm((f) => ({ ...f, referredBy: e.target.value }))}
                        maxLength={200}
                        className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Their name"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="alumni-bio" className="block text-sm font-medium text-stone-700 mb-1.5">
                      About you
                    </label>
                    <textarea
                      id="alumni-bio"
                      required
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder={
                        ticketType === "alumni"
                          ? "What are you working on these days? A sentence or two."
                          : "What do you do? What are you into?"
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="alumni-teach" className="block text-sm font-medium text-stone-700 mb-1.5">
                      A skill you&apos;d be open to teaching{" "}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="alumni-teach"
                      type="text"
                      value={form.teachSkill}
                      onChange={(e) => setForm((f) => ({ ...f, teachSkill: e.target.value }))}
                      maxLength={300}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Improv comedy, close-up magic, how to tell a story that lands"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Social profiles{" "}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {([
                        { key: "instagram", label: "Instagram", placeholder: "yourhandle" },
                        { key: "x", label: "X (Twitter)", placeholder: "yourhandle" },
                        { key: "linkedin", label: "LinkedIn", placeholder: "yourhandle" },
                        { key: "website", label: "Website", placeholder: "yoursite.com" },
                      ] as const).map((platform) => (
                        <div key={platform.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <label htmlFor={`alumni-social-${platform.key}`} className="text-sm text-stone-500 sm:w-24 sm:flex-shrink-0">
                            {platform.label}
                          </label>
                          <input
                            id={`alumni-social-${platform.key}`}
                            type="text"
                            value={form.socials[platform.key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, socials: { ...f.socials, [platform.key]: e.target.value } }))
                            }
                            maxLength={200}
                            className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base sm:text-sm"
                            placeholder={platform.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {submitting ? "Registering..." : `Register — ${formatPrice(price)}`}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── STEP: SUBMITTED ── */}
          {step === "submitted" && (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                You&apos;re on the list.
              </h2>
              <p className="text-stone-500 leading-relaxed max-w-md mx-auto mb-2">
                We&apos;ve got your details. We&apos;ll be in touch
                with next steps and payment info shortly.
              </p>
              <p className="text-sm text-stone-400">
                July 27–29, 2026 &middot; Victoria, Canada
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-lg font-bold text-stone-900 mb-1">
                Interesting People
                <sup className="text-blue-600 text-xs">4</sup>
              </p>
              <p className="text-sm text-stone-400">
                A gathering for the genuinely curious.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <Link href="/" className="text-stone-500 hover:text-stone-900 transition-colors">Home</Link>
              <Link href="/privacy" className="text-stone-500 hover:text-stone-900 transition-colors">Privacy</Link>
              <a href="mailto:hello@interestingpeople.com" className="text-stone-500 hover:text-stone-900 transition-colors">
                hello@interestingpeople.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
