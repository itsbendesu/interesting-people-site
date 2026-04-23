"use client";

import Link from "next/link";
import { useState } from "react";

const HOTEL_COST = 1500;
const ACTUAL_COST = { hotel: 4499, local: 2999 };

const PRICING = {
  hotel: { min: 0, max: 19999 },
  local: { min: 0, max: 19999 },
};

const SCHOLARSHIP_DESCRIPTIONS = [
  "someone brilliant who couldn't otherwise afford to be here",
  "an interesting person who'd never get this chance",
  "someone early in their career who belongs in the room",
  "a brilliant person who'll remember this weekend for the rest of their life",
];

function getDescription(index: number) {
  return SCHOLARSHIP_DESCRIPTIONS[index % SCHOLARSHIP_DESCRIPTIONS.length];
}

const TICKET_COST = ACTUAL_COST.local; // ~$2,999 — the ticket portion
const FULL_COST_HOTEL = HOTEL_COST + TICKET_COST; // hotel + ticket

function getSliderLabel(value: number, type: "hotel" | "local") {
  if (type === "hotel") {
    if (value === 0) return "Completely free";
    if (value < HOTEL_COST) return "Partially covering your hotel";
    if (value < HOTEL_COST * 1.02) return "Hotel covered";
    if (value < FULL_COST_HOTEL * 0.7) return "Hotel covered, contributing toward your ticket";
    if (value < FULL_COST_HOTEL) return "Hotel covered, nearly covering your ticket too";
    if (value < FULL_COST_HOTEL * 1.02) return "Hotel and ticket fully covered";
    if (value < FULL_COST_HOTEL + TICKET_COST) return "Someone else gets to be there because of you";
    if (value < FULL_COST_HOTEL + TICKET_COST * 2) return "Filling the room with people who belong here";
    return "This is seriously generous";
  }
  if (value === 0) return "Completely free";
  if (value < TICKET_COST * 0.15) return "A little something";
  if (value < TICKET_COST * 0.35) return "A meaningful contribution";
  if (value < TICKET_COST * 0.65) return "Covering a real chunk of your ticket";
  if (value < TICKET_COST) return "Nearly covering your ticket";
  if (value < TICKET_COST * 1.02) return "Your ticket is covered";
  if (value < TICKET_COST * 1.5) return "Someone else gets to be there because of you";
  if (value < TICKET_COST * 2.5) return "Filling the room with people who belong here";
  return "This is seriously generous";
}

function formatPrice(amount: number) {
  if (amount === 0) return "Free";
  return "$" + amount.toLocaleString("en-US");
}

type Step = "pricing" | "form" | "submitted";

export default function GratisPage() {
  const [type, setType] = useState<"hotel" | "local">("hotel");
  const max = PRICING[type].max;
  const [hotelValue, setHotelValue] = useState(2500);
  const [localValue, setLocalValue] = useState(1000);
  const [step, setStep] = useState<Step>("pricing");

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

  const value = type === "hotel" ? hotelValue : localValue;
  const setValue = type === "hotel" ? setHotelValue : setLocalValue;
  const pct = (value / max) * 100;
  const sliderLabel = getSliderLabel(value, type);
  const cost = ACTUAL_COST[type];

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
          ticketType: type === "hotel" ? "gratis-hotel" : "gratis-local",
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
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 font-bold text-lg text-stone-900 tracking-tight"
          >
            Interesting People
            <sup className="text-blue-600 text-sm font-bold">4</sup>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="hidden md:block text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/apply"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition-all"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {step !== "submitted" && (
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm font-medium tracking-[0.15em] text-blue-600 uppercase mb-4">
            Personal Invitation
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
            This one&apos;s on Andrew.
          </h1>
          <div className="text-lg md:text-xl text-stone-600 leading-relaxed space-y-4">
            <p>
              Andrew wants you at IP4 — your ticket is completely covered.
            </p>
            <p>
              If you need a hotel room, that&apos;s on you (about {formatPrice(HOTEL_COST)} for the weekend).
              If you&apos;re local or have your own accommodations, just select &ldquo;No hotel&rdquo; below.
            </p>
            <p>
              Beyond the hotel, if you&apos;re in a position to contribute anything at all,
              it goes straight to seats for interesting people who
              otherwise couldn&apos;t afford to be there.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Main Content */}
      <section className={`pb-24 md:pb-32 ${step === "submitted" ? "pt-32 md:pt-40" : ""}`}>
        <div className="max-w-2xl mx-auto px-6">

          {/* ── STEP: PRICING ── */}
          {step === "pricing" && (
            <>
              {/* Hotel Toggle — prominent two-option picker */}
              <div className="mb-10">
                <p className="text-center text-sm font-medium text-stone-500 mb-4">
                  First: do you need a hotel?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                  <button
                    onClick={() => setType("hotel")}
                    className={`relative text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                      type === "hotel"
                        ? "border-blue-600 bg-blue-50 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    {type === "hotel" && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    <span className="text-2xl block mb-1">🏨</span>
                    <span className={`block font-semibold ${type === "hotel" ? "text-blue-900" : "text-stone-900"}`}>Yes, I need a hotel</span>
                    <span className={`block text-xs mt-0.5 ${type === "hotel" ? "text-blue-700" : "text-stone-500"}`}>3 nights at a 5-star hotel</span>
                  </button>
                  <button
                    onClick={() => setType("local")}
                    className={`relative text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                      type === "local"
                        ? "border-blue-600 bg-blue-50 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    {type === "local" && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    <span className="text-2xl block mb-1">🏠</span>
                    <span className={`block font-semibold ${type === "local" ? "text-blue-900" : "text-stone-900"}`}>No, I&apos;m local</span>
                    <span className={`block text-xs mt-0.5 ${type === "local" ? "text-blue-700" : "text-stone-500"}`}>I&apos;ll sleep at home</span>
                  </button>
                </div>
              </div>

              {/* Slider Section */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-8 shadow-sm">
                <p className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase mb-2">
                  {type === "hotel" ? "Hotel + optional contribution" : "Pay what you want"}
                </p>
                <p className="text-sm text-stone-500 mb-8">
                  {type === "hotel"
                    ? `Your hotel runs ${formatPrice(HOTEL_COST)} for the weekend, and each ticket costs us ${formatPrice(TICKET_COST)} to produce. Whatever you can contribute makes a real difference.`
                    : `Each seat costs us ${formatPrice(TICKET_COST)} to produce. Whatever you can contribute makes a real difference — and anything beyond that funds scholarship spots.`
                  }
                </p>

                {/* Big Price Display */}
                <div className="text-center mb-8">
                  <p className="text-5xl md:text-7xl font-bold text-stone-900 tracking-tight tabular-nums">
                    {formatPrice(value)}{" "}
                    {value > 0 && (
                      <span className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">
                        USD
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {sliderLabel}
                  </p>
                </div>

                {/* Slider with cost marker */}
                <div className="relative mb-4">
                  <input
                    type="range"
                    min={0}
                    max={max}
                    step={100}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-full appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #2563eb ${pct}%, #e7e5e4 ${pct}%)`,
                    }}
                  />
                  {/* Regular price tick line (pointed to by Regular callout below) */}
                  {(() => {
                    const regularPrice = type === "hotel" ? 9999 : 5999;
                    const regularPct = (regularPrice / max) * 100;
                    return (
                      <div
                        className="absolute top-0 pointer-events-none"
                        style={{ left: `${regularPct}%`, transform: "translateX(-50%)" }}
                      >
                        <div className="w-px h-5 bg-slate-500" />
                      </div>
                    );
                  })()}
                  {/* Tick marks: seat cost + each additional scholarship */}
                  {Array.from({ length: Math.floor(max / cost) }).map((_, i) => {
                    const tickValue = cost * (i + 1);
                    const tickPct = (tickValue / max) * 100;
                    const isSeatCost = i === 0;
                    const scholarshipNum = i; // 0 = seat cost, 1 = +1 person, etc.
                    const isActive = value >= tickValue;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 flex flex-col items-center pointer-events-none"
                        style={{ left: `${tickPct}%`, transform: "translateX(-50%)" }}
                      >
                        <div className={`w-px h-5 ${isActive ? "bg-blue-400" : "bg-stone-300"}`} />
                        <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isActive ? "text-blue-500" : "text-stone-400"}`}>
                          {isSeatCost ? "You" : `+${scholarshipNum}`}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between mt-5 mb-52">
                    <span className="text-xs text-stone-400">$0</span>
                    <span className="text-xs text-stone-400">
                      {formatPrice(max)}
                    </span>
                  </div>

                  {/* ─── OUR COST CALLOUT (upper row, closer to slider) ─── */}
                  {(() => {
                    const costPct = (cost / max) * 100;
                    return (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: `${costPct}%`, top: "22px", zIndex: 3 }}
                      >
                        <svg
                          width="96"
                          height="72"
                          viewBox="0 0 96 72"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute -top-2 -left-1 overflow-visible"
                        >
                          <path
                            d="M 72 66 C 50 56, 28 40, 14 20 C 10 14, 9 10, 8 8"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            pathLength={1}
                            className="animate-draw-path"
                          />
                          <polygon
                            points="4,3 16,7 10,16"
                            fill="#f59e0b"
                            className="animate-fade-in-late"
                          />
                        </svg>
                        <div
                          className="mt-[62px] ml-10 inline-flex flex-col items-start bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 shadow-[0_6px_20px_rgba(245,158,11,0.2)] animate-cost-in animate-cost-wiggle"
                          style={{ transformOrigin: "top left" }}
                        >
                          <span className="text-[9px] font-bold tracking-[0.15em] text-amber-600 uppercase leading-none">
                            Our cost
                          </span>
                          <span className="text-base font-bold text-stone-900 tabular-nums leading-tight mt-1">
                            {formatPrice(cost)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ─── REGULAR PRICE CALLOUT (lower row, longer arrow reaching all the way to slider) ─── */}
                  {(() => {
                    const regularPrice = type === "hotel" ? 9999 : 5999;
                    const regularPct = (regularPrice / max) * 100;
                    const gift = Math.max(0, regularPrice - value);
                    return (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: `${regularPct}%`, top: "22px", zIndex: 3 }}
                      >
                        <svg
                          width="100"
                          height="152"
                          viewBox="0 0 100 152"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute -top-2 overflow-visible"
                          style={{ left: "-8px" }}
                        >
                          <path
                            d="M 78 146 C 70 128, 56 104, 40 78 C 26 54, 16 30, 12 16 C 11 13, 10.5 11, 10 10"
                            stroke="#64748b"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            pathLength={1}
                            className="animate-draw-path-delayed"
                          />
                          <polygon
                            points="6,5 18,9 12,18"
                            fill="#64748b"
                            className="animate-fade-in-later"
                          />
                        </svg>
                        <div
                          className="mt-[142px] ml-14 inline-flex flex-col items-start bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 shadow-[0_6px_20px_rgba(71,85,105,0.18)] animate-regular-in animate-regular-wiggle"
                          style={{ transformOrigin: "top left" }}
                        >
                          <span className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase leading-none">
                            Regular price
                          </span>
                          <span className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-1">
                            {formatPrice(regularPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Impact breakdown */}
                {value > 0 && (() => {
                  const fullCost = type === "hotel" ? FULL_COST_HOTEL : TICKET_COST;
                  const aboveFullCost = Math.max(0, value - fullCost);
                  const scholarshipsFloat = aboveFullCost / TICKET_COST;
                  const fullScholarships = Math.floor(scholarshipsFloat);
                  const partialPct = Math.round((scholarshipsFloat - fullScholarships) * 100);
                  const totalPeople = fullScholarships + (partialPct > 0 ? 1 : 0);
                  const isScholarshipTerritory = value > fullCost;

                  return (
                    <div className={`mt-6 rounded-xl px-5 py-5 text-center transition-colors duration-300 ${
                      isScholarshipTerritory
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-stone-50 border border-stone-200"
                    }`}>
                      {type === "hotel" && value < HOTEL_COST ? (
                        <p className="text-sm text-stone-600">
                          That covers {Math.round((value / HOTEL_COST) * 100)}% of your hotel room.
                        </p>
                      ) : type === "hotel" && value < FULL_COST_HOTEL ? (
                        <p className="text-sm text-stone-600">
                          Hotel covered. That also covers {Math.round(((value - HOTEL_COST) / TICKET_COST) * 100)}% of your ticket —
                          every dollar makes it easier to bring in more interesting people.
                        </p>
                      ) : !isScholarshipTerritory ? (
                        <p className="text-sm text-stone-600">
                          That covers {Math.round((value / TICKET_COST) * 100)}% of your ticket —
                          every dollar makes it easier to bring in more interesting people.
                        </p>
                      ) : (
                        <>
                          {/* Person icons */}
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {Array.from({ length: Math.min(totalPeople, 4) }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  i < fullScholarships
                                    ? "bg-emerald-500 text-white scale-100"
                                    : "bg-emerald-200 text-emerald-600 scale-95"
                                }`}
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                              </div>
                            ))}
                          </div>

                          <p className="text-sm text-emerald-800 leading-relaxed">
                            {type === "hotel" ? "Hotel and ticket covered. " : "Ticket covered. "}
                            The extra <strong>{formatPrice(aboveFullCost)}</strong>{" "}
                            {fullScholarships >= 2
                              ? `puts ${fullScholarships} brilliant people in the room who wouldn't be here without you.`
                              : fullScholarships === 1
                                ? `puts ${getDescription(0)} in the room.`
                                : `goes toward bringing ${getDescription(0)} into the room.`
                            }
                          </p>

                          <p className="text-lg font-bold text-emerald-700 mt-2">
                            {fullScholarships >= 1
                              ? `${fullScholarships} seat${fullScholarships > 1 ? "s" : ""} funded${partialPct > 0 ? ", working on another" : ""}`
                              : "Working toward a full scholarship seat"
                            }
                          </p>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* CTA */}
                <div className="mt-8">
                  <button
                    onClick={() => setStep("form")}
                    className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {value === 0
                      ? "Continue — Free"
                      : type === "hotel" && value === HOTEL_COST
                        ? `Continue — ${formatPrice(value)} (hotel only)`
                        : `Continue — ${formatPrice(value)}`}
                  </button>
                  <p className="text-xs text-stone-400 text-center mt-3">
                    You&apos;ll fill out a short form next. No video required.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── STEP: FORM ── */}
          {step === "form" && (
            <>
              {/* Selected price summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    {type === "hotel" ? "Ticket (free) + Hotel" : "Ticket only (free, no hotel)"}
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
                  Just the basics so we know who&apos;s coming.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="gratis-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Name
                    </label>
                    <input
                      id="gratis-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="gratis-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="gratis-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="gratis-phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="gratis-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="gratis-bio" className="block text-sm font-medium text-stone-700 mb-1.5">
                      About you
                    </label>
                    <textarea
                      id="gratis-bio"
                      required
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="What do you do? What are you into? A sentence or two is fine."
                    />
                  </div>

                  <div>
                    <label htmlFor="gratis-teach-skill" className="block text-sm font-medium text-stone-700 mb-1.5">
                      A skill I&apos;d be open to sharing with or teaching the group{" "}
                      <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="gratis-teach-skill"
                      type="text"
                      value={form.teachSkill}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, teachSkill: e.target.value }))
                      }
                      maxLength={300}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                          <label htmlFor={`gratis-social-${platform.key}`} className="text-sm text-stone-500 sm:w-24 sm:flex-shrink-0">{platform.label}</label>
                          <input
                            id={`gratis-social-${platform.key}`}
                            type="text"
                            value={form.socials[platform.key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, socials: { ...f.socials, [platform.key]: e.target.value } }))
                            }
                            className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
                    {submitting
                      ? "Registering..."
                      : value === 0
                        ? "Register — Free"
                        : `Register — ${formatPrice(value)}`}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ── STEP: SUBMITTED ── */}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                You&apos;re in.
              </h2>
              <p className="text-stone-500 leading-relaxed max-w-md mx-auto mb-2">
                We&apos;ve got your details. We&apos;ll be in touch
                with everything you need to know.
              </p>
              {value > 0 && (
                <p className="text-sm text-blue-600 font-medium mb-2">
                  Thank you for contributing {formatPrice(value)} — it makes a
                  real difference.
                </p>
              )}
              <p className="text-sm text-stone-400">
                July 27–29, 2026 &middot; Victoria, Canada
              </p>
            </div>
          )}

          {/* What's included — show on pricing and form steps */}
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
                  ...(type === "hotel"
                    ? ["3 nights at a 5-star hotel"]
                    : []),
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-stone-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
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
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
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

      {/* Custom slider styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(37, 99, 235, 0.1);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3),
            0 0 0 1px rgba(37, 99, 235, 0.2);
        }
        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(37, 99, 235, 0.1);
        }
        @keyframes draw-path {
          from { stroke-dasharray: 0 1; stroke-dashoffset: 0; }
          to   { stroke-dasharray: 1 0; stroke-dashoffset: 0; }
        }
        .animate-draw-path {
          stroke-dasharray: 0 1;
          animation: draw-path 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards;
        }
        .animate-draw-path-delayed {
          stroke-dasharray: 0 1;
          animation: draw-path 0.9s cubic-bezier(0.65, 0, 0.35, 1) 1.0s forwards;
        }
        @keyframes fade-in-arrow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-late {
          opacity: 0;
          animation: fade-in-arrow 0.25s ease-out 1.2s forwards;
        }
        .animate-fade-in-later {
          opacity: 0;
          animation: fade-in-arrow 0.25s ease-out 1.8s forwards;
        }
        @keyframes cost-in {
          0%   { opacity: 0; transform: translateY(-6px) rotate(-14deg); }
          60%  { opacity: 1; transform: translateY(2px) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) rotate(-4deg); }
        }
        .animate-cost-in {
          animation: cost-in 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.55s both;
        }
        @keyframes cost-wiggle {
          0%, 92%, 100% { transform: rotate(-4deg); }
          94% { transform: rotate(-7deg); }
          96% { transform: rotate(-1deg); }
          98% { transform: rotate(-5deg); }
        }
        .animate-cost-wiggle {
          animation: cost-wiggle 6s ease-in-out 2s infinite;
        }
        @keyframes regular-in {
          0%   { opacity: 0; transform: translateY(-6px) rotate(-11deg); }
          60%  { opacity: 1; transform: translateY(2px) rotate(0deg); }
          100% { opacity: 1; transform: translateY(0) rotate(-3deg); }
        }
        .animate-regular-in {
          animation: regular-in 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s both;
        }
        @keyframes regular-wiggle {
          0%, 92%, 100% { transform: rotate(-3deg); }
          94% { transform: rotate(-6deg); }
          96% { transform: rotate(0deg); }
          98% { transform: rotate(-4deg); }
        }
        .animate-regular-wiggle {
          animation: regular-wiggle 6s ease-in-out 2.6s infinite;
        }
      `}</style>
    </main>
  );
}
