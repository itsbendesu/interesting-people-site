"use client";

import Link from "next/link";
import { useState } from "react";

function formatPrice(amount: number) {
  return "$" + amount.toLocaleString("en-US");
}

type Step = "pricing" | "form" | "submitted";

const SUGGESTED_AMOUNTS = [19999, 24999, 34999, 49999];

export default function PatronPage() {
  const [step, setStep] = useState<Step>("pricing");
  const [value, setValue] = useState(19999);
  const [customInput, setCustomInput] = useState("");
  const [needsHotel, setNeedsHotel] = useState(true);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    teachSkill: "",
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

  const handleCustomChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    setCustomInput(digits);
    if (digits) setValue(Number(digits));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/apply/friends", {
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
          ticketType: needsHotel ? "patron-hotel" : "patron-local",
          amount: value,
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
      <section className="pt-24 pb-10 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <p className="text-xs sm:text-sm font-medium tracking-[0.15em] text-blue-600 uppercase mb-3 sm:mb-4">
            Patron Program
          </p>
          <h1 className="text-[2.25rem] leading-[1.1] sm:text-4xl md:text-6xl font-bold text-stone-900 tracking-tight mb-5 sm:mb-6">
            The room gets better when you&apos;re in it.
          </h1>
          <div className="text-base sm:text-lg md:text-xl text-stone-600 leading-relaxed space-y-4">
            <p>
              Some of the most interesting people we know are artists, writers, teachers, and founders who can&apos;t drop $10k on a conference. As a patron, every dollar above our costs goes directly toward bringing those people into the room.
            </p>
            <p>
              Last year, patron-funded seats brought in a Moth champion storyteller, an Antarctic researcher, and a 22-year-old who&apos;d built a school in rural Kenya. They made the event better for everyone &mdash; including the patrons who funded them.
            </p>
            <p>
              You&apos;ll still go through the application process — we want to get to know you. Choose your level below, then apply.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Main Content */}
      <section className={`pb-16 sm:pb-24 md:pb-32 ${step === "submitted" ? "pt-24 sm:pt-32 md:pt-40" : ""}`}>
        <div className="max-w-2xl mx-auto px-5 sm:px-6">

          {/* STEP: PRICING */}
          {step === "pricing" && (
            <>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-8 shadow-sm">
                <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-2">
                  Choose your impact
                </p>
                <p className="text-sm text-stone-500 mb-8">
                  You get the full VIP experience at every level. The difference is how many people you bring with you.
                </p>

                {/* Suggested amounts */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {([
                    { amt: 19999, label: "1 seat funded" },
                    { amt: 24999, label: "1–2 seats funded" },
                    { amt: 34999, label: "2–3 seats funded" },
                    { amt: 49999, label: "4+ seats funded" },
                  ] as const).map(({ amt, label }) => (
                    <button
                      key={amt}
                      onClick={() => { setValue(amt); setCustomInput(""); }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border flex flex-col items-center gap-0.5 ${
                        value === amt && !customInput
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-stone-700 border-stone-200 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      <span>{formatPrice(amt)}</span>
                      <span className={`text-xs ${value === amt && !customInput ? "text-blue-100" : "text-stone-400"}`}>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative mb-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg font-medium">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customInput}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="Or enter a custom amount"
                    className="w-full pl-9 pr-4 py-3.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base sm:text-lg tabular-nums"
                  />
                </div>

                {/* Big Price Display */}
                <div className="text-center mb-4 py-4">
                  <p className="text-4xl sm:text-5xl md:text-7xl font-bold text-stone-900 tracking-tight tabular-nums">
                    {formatPrice(value)} <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">USD</span>
                  </p>
                </div>

                {/* Impact message */}
                <div className="text-center mb-8 bg-green-50 border border-green-100 rounded-xl px-6 py-4">
                  <p className="text-sm font-medium text-green-800">
                    {value >= 49999
                      ? "🤝 Funds 4+ seats — you're filling a dinner table with people who wouldn't be here without you."
                      : value >= 34999
                      ? "🤝 Funds 2–3 seats — that's a filmmaker, a scientist, and a founder who'll remember this forever."
                      : value >= 24999
                      ? "🤝 Funds 1–2 seats — enough to change someone's trajectory."
                      : "🤝 Funds 1 seat — one person gets to be in the room because of you."}
                  </p>
                </div>

                {/* Hotel toggle */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex bg-stone-100 rounded-full p-1 w-full sm:w-auto">
                    <button
                      onClick={() => setNeedsHotel(true)}
                      className={`flex-1 sm:flex-none min-h-[44px] px-4 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                        needsHotel
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      I need a hotel
                    </button>
                    <button
                      onClick={() => setNeedsHotel(false)}
                      className={`flex-1 sm:flex-none min-h-[44px] px-4 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                        !needsHotel
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-700"
                      }`}
                    >
                      I&apos;m local
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <button
                    onClick={() => { if (value > 0) setStep("form"); }}
                    disabled={value <= 0}
                    className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    Continue — {formatPrice(value)}
                  </button>
                  <p className="text-xs text-stone-400 text-center mt-3">
                    Short application next — we want to get to know you.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* STEP: FORM */}
          {step === "form" && (
            <>
              {/* Selected price summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    {needsHotel ? "With Hotel" : "Local (No Hotel)"}
                  </p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">
                    {formatPrice(value)}
                  </p>
                </div>
                <button
                  onClick={() => setStep("pricing")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change
                </button>
              </div>

              {/* Registration Form */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-8 shadow-sm">
                <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-2">
                  Almost there
                </p>
                <p className="text-sm text-stone-500 mb-8">
                  Tell us about yourself so we can get to know you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="patron-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Name
                    </label>
                    <input
                      id="patron-name"
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
                    <label htmlFor="patron-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="patron-email"
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
                    <label htmlFor="patron-phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="patron-phone"
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

                  <div>
                    <label htmlFor="patron-bio" className="block text-sm font-medium text-stone-700 mb-1.5">
                      About you
                    </label>
                    <textarea
                      id="patron-bio"
                      required
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="What do you do? What are you into? A sentence or two is fine."
                    />
                  </div>

                  <div>
                    <label htmlFor="patron-teach-skill" className="block text-sm font-medium text-stone-700 mb-1.5">
                      A skill I&apos;d be open to sharing with or teaching the group{" "}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="patron-teach-skill"
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
                      <span className="text-stone-400 font-normal">
                        (optional — share at least one so we can get to know you)
                      </span>
                    </label>
                    <div className="space-y-2">
                      {([
                        { key: "instagram", label: "Instagram", placeholder: "yourhandle" },
                        { key: "x", label: "X (Twitter)", placeholder: "yourhandle" },
                        { key: "linkedin", label: "LinkedIn", placeholder: "yourhandle" },
                        { key: "tiktok", label: "TikTok", placeholder: "yourhandle" },
                        { key: "youtube", label: "YouTube", placeholder: "yourchannel" },
                        { key: "website", label: "Website", placeholder: "yoursite.com" },
                      ] as const).map((platform) => (
                        <div key={platform.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <label htmlFor={`patron-social-${platform.key}`} className="text-sm text-stone-500 sm:w-24 sm:flex-shrink-0">{platform.label}</label>
                          <input
                            id={`patron-social-${platform.key}`}
                            type="text"
                            value={form.socials[platform.key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, socials: { ...f.socials, [platform.key]: e.target.value } }))
                            }
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
                    {submitting ? "Registering..." : `Register — ${formatPrice(value)}`}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* STEP: SUBMITTED */}
          {step === "submitted" && (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                Application received.
              </h2>
              <p className="text-stone-500 leading-relaxed max-w-md mx-auto mb-2">
                We&apos;ll review your application and be in touch with
                next steps and payment info.
              </p>
              <p className="text-sm text-stone-400">
                July 27–29, 2026 &middot; Victoria, Canada
              </p>
            </div>
          )}

          {/* What's included */}
          {step !== "submitted" && (
            <div className="mt-10 bg-stone-50 rounded-2xl border border-stone-200 p-8">
              <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-5">
                What&apos;s included
              </p>
              <ul className="space-y-3">
                {[
                  "All sessions, workshops & activities",
                  "All food, drinks & transportation for 3 days",
                  "Comedy night, storytelling, magic",
                  "Curated dinner groups (skip the small talk)",
                  "Lake swims, late-night conversations, new friendships",
                  ...(needsHotel ? ["3 nights luxury accommodation"] : []),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-stone-600">
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
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
              <Link
                href="/"
                className="text-stone-500 hover:text-stone-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/privacy"
                className="text-stone-500 hover:text-stone-900 transition-colors"
              >
                Privacy
              </Link>
              <a
                href="mailto:hello@interestingpeople.com"
                className="text-stone-500 hover:text-stone-900 transition-colors"
              >
                hello@interestingpeople.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
