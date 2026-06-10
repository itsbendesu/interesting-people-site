"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

type Step = "basics" | "questions" | "story" | "confirmation";

export default function ApplyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<Step>("basics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    ticketType: "" as "" | "local" | "regular" | "vip" | "patron" | "scholarship",
    patronAmount: 19999,
    scholarshipAmount: "",
    address: "",
    localSwear: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    heardAbout: "",
    priorEvents: false,
    priorEventsWhich: [] as string[],
    threeWords: "",
    bio: "",
    teachSkill: "",
    socials: {
      instagram: "",
      x: "",
      tiktok: "",
      youtube: "",
      linkedin: "",
      website: "",
    },
    projectLinks: [""],
    // Honeypot field - bots will fill this
    website: "",
  });

  const [consentGiven, setConsentGiven] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Funnel analytics: log each wizard step a visitor reaches
  useEffect(() => {
    if (modalOpen && step !== "confirmation") track("apply_step_view", { step });
  }, [step, modalOpen]);

  // Early lead capture: persist name + email the moment they're valid on step 1,
  // so people who quit before finishing the form leave something behind to
  // follow up on. Debounced, fire-and-forget, never blocks the UI.
  const lastLeadRef = useRef("");
  useEffect(() => {
    if (!modalOpen || step === "confirmation") return;
    const name = formData.name.trim();
    const email = formData.email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailValid || formData.website) return; // need both; skip honeypot

    const signature = `${name}|${email}|${formData.phone}|${formData.ticketType}|${step}`;
    if (signature === lastLeadRef.current) return;

    const t = setTimeout(() => {
      lastLeadRef.current = signature;
      fetch("/api/apply/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone || undefined,
          ticketType: formData.ticketType || undefined,
          lastStep: step,
          website: formData.website,
        }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [modalOpen, step, formData.name, formData.email, formData.phone, formData.ticketType, formData.website]);

  useEffect(() => {
    if (!error) return;
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Map common error messages to the input that needs attention
    const lower = error.toLowerCase();
    let targetId: string | null = null;
    if (lower.includes("name")) targetId = "apply-name";
    else if (lower.includes("email")) targetId = "apply-email";
    else if (lower.includes("phone")) targetId = "apply-phone";
    else if (lower.includes("ticket")) targetId = "apply-ticket-type-label";
    else if (lower.includes("address")) targetId = "apply-address";
    else if (lower.includes("victoria")) targetId = "apply-address";
    else if (lower.includes("heard")) targetId = "apply-heard-about";
    else if (lower.includes("3 words") || lower.includes("three words")) targetId = "apply-three-words";
    else if (lower.includes("bio")) targetId = "apply-bio";
    else if (lower.includes("social") || lower.includes("profile")) targetId = "apply-social-instagram";
    else if (lower.includes("project") || lower.includes("link")) targetId = "apply-social-instagram";
    if (targetId) {
      // Defer to next frame so the scrollIntoView above doesn't fight focus()
      requestAnimationFrame(() => {
        const el = document.getElementById(targetId!) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (typeof (el as HTMLInputElement).focus === "function") {
            (el as HTMLInputElement).focus({ preventScroll: true });
          }
        }
      });
    }
  }, [error]);

  // Warn before leaving if form has data
  useEffect(() => {
    const hasData = Object.entries(formData).some(([key, val]) => {
      if (key === "timezone" || key === "localSwear" || key === "priorEvents") return false;
      if (key === "priorEventsWhich" || key === "projectLinks") return (val as string[]).some((v) => v.trim());
      if (key === "socials") return Object.values(val as Record<string, string>).some((v) => v.trim());
      return typeof val === "string" && val.trim() !== "";
    });

    if (!hasData || step === "confirmation") return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formData, step]);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!modalOpen) return;

    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === "confirmation") {
        setModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [modalOpen, step, formData.name, formData.email]);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeSocialUrl = (platform: string, value: string): string => {
    const v = value.trim();
    if (!v) return "";
    // Already a full URL
    if (/^https?:\/\//i.test(v)) return v;
    // Has a domain (e.g. www.instagram.com/handle or instagram.com/handle)
    if (v.includes(".")) return `https://${v}`;
    // Bare handle — build platform URL
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

  const updateSocial = (platform: string, value: string) => {
    setFormData((prev) => ({ ...prev, socials: { ...prev.socials, [platform]: value } }));
  };

  const updateProjectLink = (index: number, value: string) => {
    const newLinks = [...formData.projectLinks];
    newLinks[index] = value;
    setFormData((prev) => ({ ...prev, projectLinks: newLinks }));
  };

  const addProjectLink = () => {
    if (formData.projectLinks.length < 5) {
      setFormData((prev) => ({ ...prev, projectLinks: [...prev.projectLinks, ""] }));
    }
  };

  const removeProjectLink = (index: number) => {
    const newLinks = formData.projectLinks.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, projectLinks: newLinks.length ? newLinks : [""] }));
  };

  const validateStep = (s: Step) => {
    if (s === "basics") {
      if (!formData.name.trim()) return "Name is required";
      if (!formData.email.trim() || !formData.email.includes("@")) return "Valid email is required";
      if (!formData.phone.trim()) return "Phone number is required";
      if (!formData.ticketType) return "Please select a ticket type";
      if (formData.ticketType === "local" && !formData.address.trim()) return "Address is required for Local tickets";
      if (formData.ticketType === "local" && !formData.localSwear) return "Please confirm you live in Victoria";
    }
    if (s === "questions") {
      if (!formData.heardAbout.trim()) return "Please tell us how you heard about IP";
      if (!formData.threeWords.trim()) return "Please describe yourself in 3 words";
    }
    if (s === "story") {
      if (!formData.bio.trim() || formData.bio.length < 10) return "Bio must be at least 10 characters";
      if (formData.bio.length > 500) return "Bio must be under 500 characters";
      const filledSocials = Object.entries(formData.socials).filter(([, v]) => v.trim());
      if (filledSocials.length === 0) return "Please share at least one social or personal profile";
      for (const [platform, value] of filledSocials) {
        const url = normalizeSocialUrl(platform, value);
        try { new URL(url); } catch { return `Invalid profile for ${platform}`; }
      }
      const nonEmptyProjectLinks = formData.projectLinks.filter((l) => l.trim());
      for (const link of nonEmptyProjectLinks) {
        const normalized = /^https?:\/\//i.test(link) ? link : `https://${link}`;
        try { new URL(normalized); } catch { return "Please enter valid URLs for all project links"; }
      }
      if (!consentGiven) return "You must agree to the privacy policy to continue";
    }
    return null;
  };

  const infoSteps: Step[] = ["basics", "questions", "story"];

  const findFirstIncompleteStep = (): Step => {
    for (const s of infoSteps) {
      if (validateStep(s)) return s;
    }
    return "story"; // All complete — land on story for final review
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      track("apply_validation_error", { step });
      return;
    }
    setError(null);
    const idx = infoSteps.indexOf(step);
    if (idx < infoSteps.length - 1) {
      setStep(infoSteps[idx + 1]);
    }
  };

  const handleBack = () => {
    setError(null);
    const idx = infoSteps.indexOf(step);
    if (idx > 0) {
      setStep(infoSteps[idx - 1]);
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep("story");
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allLinks = [
        ...Object.entries(formData.socials)
          .filter(([, v]) => v.trim())
          .map(([platform, value]) => normalizeSocialUrl(platform, value)),
        ...formData.projectLinks
          .filter((l) => l.trim())
          .map((l) => /^https?:\/\//i.test(l) ? l : `https://${l}`),
      ];

      const res = await fetch("/api/apply/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          ticketType: formData.ticketType,
          scholarshipAmount: formData.ticketType === "scholarship" ? formData.scholarshipAmount : formData.ticketType === "patron" ? `$${formData.patronAmount.toLocaleString("en-US")}` : undefined,
          address: formData.ticketType === "local" ? formData.address : undefined,
          timezone: formData.timezone,
          heardAbout: formData.heardAbout,
          priorEvents: formData.priorEvents
            ? `Yes — ${formData.priorEventsWhich.join(", ") || "unspecified"}`
            : "No",
          threeWords: formData.threeWords,
          bio: formData.bio,
          teachSkill: formData.teachSkill || undefined,
          links: allLinks.length ? allLinks : undefined,
          website: formData.website, // Honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start application");
      }

      track("apply_info_submitted", { ticketType: formData.ticketType });

      // Finalize immediately — there is no video step anymore.
      const completeRes = await fetch("/api/apply/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });

      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        throw new Error(completeData.error || "Failed to submit application");
      }

      setStep("confirmation");
      setHasSubmitted(true);
      track("apply_submitted", { ticketType: formData.ticketType });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      track("apply_info_error", { message: message.slice(0, 100) });
    } finally {
      setLoading(false);
    }
  };

  // Modal close logic
  const canCloseModal = !loading;

  const handleCloseModal = () => {
    if (!canCloseModal) return;
    setModalOpen(false);
  };

  // Modal width based on step
  const modalMaxWidth = step === "confirmation" ? "36rem" : "40rem";

  // Step progress dots
  const allStepsOrder: Step[] = ["basics", "questions", "story", "confirmation"];
  const currentStepIdx = allStepsOrder.indexOf(step);

  const stepDots = (
    <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-500">
      {(
        [
          { key: "basics", label: "Basics", idx: 0 },
          { key: "questions", label: "Details", idx: 1 },
          { key: "story", label: "Story", idx: 2 },
        ] as const
      ).map((s, i) => {
        const isConfirmation = step === "confirmation";
        const isActive = s.key === step;
        const isCompleted =
          isConfirmation ||
          (s.key === "basics" && currentStepIdx > 0) ||
          (s.key === "questions" && currentStepIdx > 1) ||
          (s.key === "story" && currentStepIdx > 2);
        return (
          <span key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-4 sm:w-8 h-px bg-slate-200" />}
            <span
              className={`flex items-center gap-1.5 ${isActive && !isConfirmation ? "text-slate-900 font-medium" : ""}`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                  isConfirmation
                    ? "bg-emerald-100 text-emerald-600"
                    : isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-bold text-lg text-stone-900 tracking-tight">
            Interesting People
            <sup className="text-blue-600 text-sm font-bold">4</sup>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </nav>

      {/* Landing page content */}
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-10">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-2">
            Apply to Interesting People
          </h1>
          <p className="text-lg md:text-xl text-slate-500">
            Be interesting. Be nice. That&apos;s basically it.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-6 md:mb-8">
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-4 text-center">
            Here&apos;s how it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                num: 1,
                title: "Tell us about yourself",
                desc: "Name, location, a short bio, and a few quick questions. Takes about 3 minutes.",
              },
              {
                num: 2,
                title: "We review & respond",
                desc: "Our team reads every application. We\u2019ll get back to you within a few weeks.",
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-3 p-4 sm:p-5 rounded-2xl bg-slate-50">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {item.num}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => { setStep(findFirstIncompleteStep()); setModalOpen(true); track("apply_opened"); }}
            disabled={hasSubmitted}
            className={`px-10 py-3.5 rounded-full font-medium text-lg transition-all ${
              hasSubmitted
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-cta-glow"
            }`}
          >
            {hasSubmitted ? "Application Submitted" : "Get Started"}
          </button>
          <p className="mt-2 text-sm text-slate-400">
            {hasSubmitted ? "You\u2019ve already submitted your application." : "Takes about 3 minutes"}
          </p>
        </div>
      </div>

      {/* Modal overlay */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-6"
        >
          <div
            className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative transition-[max-width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ maxWidth: modalMaxWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            {step !== "confirmation" && (
              <div className="sticky top-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  {stepDots}
                  {canCloseModal && (
                    <button
                      onClick={handleCloseModal}
                      className="ml-4 -mr-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation header — just a close button */}
            {step === "confirmation" && (
              <div className="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl z-10 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="-mr-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Modal body */}
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              {/* Step heading (form steps) */}
              {(step === "basics" || step === "questions" || step === "story") && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1.5 sm:mb-2">
                    {step === "basics" && "Let\u2019s start with the basics."}
                    {step === "questions" && "A few quick questions."}
                    {step === "story" && "Now tell us your story."}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500">
                    {step === "basics" && "No cover letter. No credentials. We want to know what makes you interesting."}
                    {step === "questions" && "Just a couple things so we can get to know you better."}
                    {step === "story" && "This is the fun part\u2014tell us what lights you up."}
                  </p>
                </div>
              )}

              {/* Error banner */}
              {error && step !== "confirmation" && (
                <div ref={errorRef} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: The basics */}
              {step === "basics" && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="apply-name" className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name
                      </label>
                      <input
                        id="apply-name"
                        type="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        enterKeyHint="next"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-email" className="block text-sm font-medium text-slate-900 mb-2">
                        Email
                      </label>
                      <input
                        id="apply-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="next"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-phone" className="block text-sm font-medium text-slate-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="apply-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        enterKeyHint="next"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label id="apply-ticket-type-label" className="block text-sm font-medium text-slate-900 mb-3">
                        Ticket Type
                      </label>
                      <div className="space-y-3">
                        {/* Local */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, ticketType: "local" }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                            formData.ticketType === "local"
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className={`font-semibold ${formData.ticketType === "local" ? "text-white" : "text-slate-900"}`}>🏠 Local</span>
                            <span className={`font-semibold ${formData.ticketType === "local" ? "text-white" : "text-slate-900"}`}>$5,999</span>
                          </div>
                          <p className={`text-sm mt-1 ${formData.ticketType === "local" ? "text-blue-100" : "text-slate-500"}`}>All sessions, meals &amp; activities. No hotel &mdash; Victoria residents only.</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "local" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>🍽 All meals</span>
                          </div>
                        </button>

                        {/* Regular */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, ticketType: "regular" }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                            formData.ticketType === "regular"
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className={`font-semibold ${formData.ticketType === "regular" ? "text-white" : "text-slate-900"}`}>🎟️ Regular</span>
                            <span className={`font-semibold ${formData.ticketType === "regular" ? "text-white" : "text-slate-900"}`}>$8,999</span>
                          </div>
                          <p className={`text-sm mt-1 ${formData.ticketType === "regular" ? "text-blue-100" : "text-slate-500"}`}>All sessions, meals, activities &amp; 3 nights at a 5-star hotel.</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "regular" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>🏨 5-star hotel</span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "regular" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>🍽 All meals</span>
                          </div>
                        </button>

                        {/* VIP — Most Popular */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, ticketType: "vip" }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                            formData.ticketType === "vip"
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className={`font-semibold ${formData.ticketType === "vip" ? "text-white" : "text-slate-900"}`}>⭐ VIP</span>
                            <span className={`font-semibold ${formData.ticketType === "vip" ? "text-white" : "text-slate-900"}`}>$14,999</span>
                          </div>
                          <p className={`text-sm mt-1 ${formData.ticketType === "vip" ? "text-blue-100" : "text-slate-500"}`}>Upgraded suite, black car service, and a private dinner with the speakers.</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "vip" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>🏨 5-star hotel</span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "vip" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>🍽 All meals</span>
                          </div>
                          <p className={`text-xs font-semibold mt-1.5 ${formData.ticketType === "vip" ? "text-blue-200" : "text-blue-700"}`}>Limited to 20 spots</p>
                        </button>

                        {/* Patron */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, ticketType: "patron" }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                            formData.ticketType === "patron"
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className={`font-semibold ${formData.ticketType === "patron" ? "text-white" : "text-slate-900"}`}>💛 Patron</span>
                            <span className={`font-semibold ${formData.ticketType === "patron" ? "text-white" : "text-slate-900"}`}>$19,999+</span>
                          </div>
                          <p className={`text-sm mt-1 ${formData.ticketType === "patron" ? "text-blue-100" : "text-slate-500"}`}>The full VIP experience. Every dollar above cost funds the comedians, musicians, artists, and scientists who make these three days unforgettable.</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "patron" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>🏨 5-star hotel</span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "patron" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>🍽 All meals</span>
                          </div>
                        </button>

                        {/* Patron expanded options */}
                        {formData.ticketType === "patron" && (
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4 -mt-1">
                            <p className="text-sm text-slate-700">
                              <span className="font-bold text-slate-900">Thank you.</span> Every dollar above our costs puts someone in the room &mdash; an artist, a researcher, a founder &mdash; who&apos;d make the gathering better for everyone but can&apos;t afford the ticket.
                            </p>
                            <div>
                              <label className="block text-sm font-medium text-slate-900 mb-2">
                                Choose your level
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {([
                                  { amt: 19999, label: "1 seat funded" },
                                  { amt: 24999, label: "1\u20132 seats funded" },
                                  { amt: 34999, label: "2\u20133 seats funded" },
                                  { amt: 49999, label: "4+ seats funded" },
                                ] as const).map(({ amt, label }) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, patronAmount: amt }))}
                                    className={`min-h-[56px] px-3 py-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center justify-center ${
                                      formData.patronAmount === amt
                                        ? "bg-stone-900 text-white border-stone-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <span>${amt.toLocaleString("en-US")}</span>
                                    <span className={`text-xs ${formData.patronAmount === amt ? "text-stone-400" : "text-slate-400"}`}>{label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pay What You Can */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, ticketType: "scholarship" }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                            formData.ticketType === "scholarship"
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className={`font-semibold ${formData.ticketType === "scholarship" ? "text-white" : "text-slate-900"}`}>🤝 Pay What You Can</span>
                            <span className={`font-semibold ${formData.ticketType === "scholarship" ? "text-white" : "text-slate-500"}`}>Flexible</span>
                          </div>
                          <p className={`text-sm mt-1 ${formData.ticketType === "scholarship" ? "text-amber-100" : "text-slate-500"}`}>Same experience, same everything. For people whose work is more interesting than their bank account. Funded by our Patrons.</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "scholarship" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>🏨 5-star hotel</span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${formData.ticketType === "scholarship" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"}`}>🍽 All meals</span>
                          </div>
                        </button>

                        {/* Pay What You Can expanded input */}
                        {formData.ticketType === "scholarship" && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl -mt-1 space-y-3">
                            <p className="text-sm text-slate-700">This is for people who genuinely can&apos;t swing the ticket price &mdash; not a discount code. If your company would expense it or you&apos;d spend this on a nice vacation, please choose another tier. But if you&apos;re a freelance artist, a teacher, a nonprofit lifer, or doing work that doesn&apos;t pay what it&apos;s worth? This is exactly who it&apos;s for.</p>
                            <label htmlFor="apply-scholarship-amount" className="block text-sm font-medium text-slate-900">
                              What can you put toward a ticket?
                            </label>
                            <input
                              id="apply-scholarship-amount"
                              type="text"
                              inputMode="text"
                              enterKeyHint="next"
                              value={formData.scholarshipAmount}
                              onChange={(e) => updateField("scholarshipAmount", e.target.value)}
                              className="w-full px-4 py-3.5 text-base border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow bg-white"
                              placeholder="e.g. $500, $2,000, whatever works"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.ticketType === "local" && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="apply-address" className="block text-sm font-medium text-slate-900 mb-2">
                            Street Address
                          </label>
                          <input
                            id="apply-address"
                            type="text"
                            autoComplete="street-address"
                            autoCapitalize="words"
                            enterKeyHint="next"
                            value={formData.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                            placeholder="Your Victoria, BC address"
                          />
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer py-2 -my-2 min-h-[44px]">
                          <input
                            type="checkbox"
                            checked={formData.localSwear}
                            onChange={(e) => setFormData((prev) => ({ ...prev, localSwear: e.target.checked }))}
                            className="mt-1 h-5 w-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                          />
                          <span className="text-sm text-slate-600 leading-relaxed">
                            I solemnly swear I actually live here, in Victoria, as my primary residence. (This will be verified by our team.)
                          </span>
                        </label>
                      </div>
                    )}

                  </div>

                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Step 2: Quick questions */}
              {step === "questions" && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="apply-heard-about" className="block text-sm font-medium text-slate-900 mb-2">
                        How did you hear about Interesting People?
                      </label>
                      <input
                        id="apply-heard-about"
                        type="text"
                        enterKeyHint="next"
                        value={formData.heardAbout}
                        onChange={(e) => updateField("heardAbout", e.target.value)}
                        maxLength={500}
                        className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        placeholder="Friend, Twitter, newsletter, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-3">
                        Have you ever attended any IP events in the past?
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priorEvents: true }))}
                          className={`min-h-[44px] px-6 py-3 rounded-xl text-base font-medium transition-all ${
                            formData.priorEvents
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priorEvents: false, priorEventsWhich: [] }))}
                          className={`min-h-[44px] px-6 py-3 rounded-xl text-base font-medium transition-all ${
                            !formData.priorEvents
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          No
                        </button>
                      </div>
                      {formData.priorEvents && (
                        <div className="mt-4">
                          <p className="text-sm text-slate-500 mb-3">Which ones?</p>
                          <div className="flex gap-3">
                            {["IP1", "IP2", "IP3"].map((event) => (
                              <button
                                key={event}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    priorEventsWhich: prev.priorEventsWhich.includes(event)
                                      ? prev.priorEventsWhich.filter((e) => e !== event)
                                      : [...prev.priorEventsWhich, event],
                                  }))
                                }
                                className={`min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl text-base font-medium transition-all ${
                                  formData.priorEventsWhich.includes(event)
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {event}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="apply-three-words" className="block text-sm font-medium text-slate-900 mb-2">
                        Describe yourself in 3 words <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="apply-three-words"
                        type="text"
                        enterKeyHint="next"
                        value={formData.threeWords}
                        onChange={(e) => updateField("threeWords", e.target.value)}
                        className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-4 border border-slate-200 text-slate-700 rounded-full font-medium text-lg hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Tell us more */}
              {step === "story" && (
                <form onSubmit={handleSubmitInfo} className="space-y-8">
                  <div>
                    <label htmlFor="apply-bio" className="block text-sm font-medium text-slate-900 mb-1">
                      Short Bio
                    </label>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-slate-500">
                        What makes you tick? What are you curious about? Skip the job title.
                      </p>
                      <span className="text-xs text-slate-400 font-mono ml-4 flex-shrink-0">
                        {formData.bio.length}/500
                      </span>
                    </div>
                    <textarea
                      id="apply-bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      rows={5}
                      maxLength={500}
                      enterKeyHint="enter"
                      className="w-full min-h-[8rem] px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y bg-white"
                      placeholder="I spend my evenings building mechanical keyboards and arguing about which pizza style is best..."
                    />
                  </div>

                  <div>
                    <label htmlFor="apply-teach-skill" className="block text-sm font-medium text-slate-900 mb-1">
                      A skill I&apos;d be open to sharing with or teaching the group{" "}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <p className="text-sm text-slate-500 mb-3">
                      Pottery, poker, bread baking, stand-up comedy, whatever you&apos;ve got.
                    </p>
                    <input
                      id="apply-teach-skill"
                      type="text"
                      enterKeyHint="next"
                      value={formData.teachSkill}
                      onChange={(e) => updateField("teachSkill", e.target.value)}
                      maxLength={300}
                      className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                      placeholder="e.g. Improv comedy, close-up magic, how to tell a story that lands"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Social Profiles <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-slate-500 mb-3">
                      At least one required.
                    </p>
                    <div className="space-y-4 sm:space-y-3">
                      {([
                        { key: "instagram", label: "Instagram", placeholder: "yourhandle" },
                        { key: "x", label: "X (Twitter)", placeholder: "yourhandle" },
                        { key: "linkedin", label: "LinkedIn", placeholder: "yourhandle" },
                        { key: "tiktok", label: "TikTok", placeholder: "yourhandle" },
                        { key: "youtube", label: "YouTube", placeholder: "yourchannel" },
                        { key: "website", label: "Personal Website", placeholder: "yoursite.com" },
                      ] as const).map((platform) => (
                        <div key={platform.key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                          <label htmlFor={`apply-social-${platform.key}`} className="text-sm font-medium text-slate-700 sm:font-normal sm:text-slate-500 sm:w-32 sm:flex-shrink-0">{platform.label}</label>
                          <input
                            id={`apply-social-${platform.key}`}
                            type={platform.key === "website" ? "url" : "text"}
                            inputMode={platform.key === "website" ? "url" : "text"}
                            autoComplete={platform.key === "website" ? "url" : "off"}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="next"
                            value={formData.socials[platform.key]}
                            onChange={(e) => updateSocial(platform.key, e.target.value)}
                            maxLength={200}
                            className="flex-1 px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                            placeholder={platform.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Projects &amp; Businesses
                      <span className="text-slate-400 font-normal ml-2">(optional)</span>
                    </label>
                    <p className="text-sm text-slate-500 mb-3">
                      Links to anything you&apos;ve built, run, or are working on.
                    </p>
                    {formData.projectLinks.map((link, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="url"
                          inputMode="url"
                          autoComplete="off"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          enterKeyHint="next"
                          value={link}
                          onChange={(e) => updateProjectLink(i, e.target.value)}
                          className="flex-1 px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                          placeholder="yourproject.com"
                        />
                        {formData.projectLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProjectLink(i)}
                            aria-label="Remove link"
                            className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.projectLinks.length < 5 && (
                      <button
                        type="button"
                        onClick={addProjectLink}
                        className="inline-flex items-center min-h-[44px] py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1"
                      >
                        + Add another link
                      </button>
                    )}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Privacy consent checkbox */}
                  <label className="flex items-start gap-4 cursor-pointer py-2 -my-2 min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 h-5 w-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-500 leading-relaxed">
                      I understand that my application will be reviewed by the selection team and agree to the{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-slate-900 hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                      , including how my data will be handled.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-4 border border-slate-200 text-slate-700 rounded-full font-medium text-lg hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                  <p className="text-center text-sm text-slate-500">
                    Reminder: you can only submit your application once.
                  </p>
                </form>
              )}

              {/* Confirmation step */}
              {step === "confirmation" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-3">
                    You&apos;re in the queue.
                  </h2>

                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    Thanks for putting yourself out there. We read every single
                    application and will be in touch.
                  </p>

                  <div className="text-left max-w-sm mx-auto mb-8">
                    {[
                      {
                        num: "1",
                        title: "We read your application",
                        desc: "A real human reviews every application.",
                      },
                      {
                        num: "2",
                        title: "We email you",
                        desc: "Yes, no, or waitlist\u2014we\u2019ll let you know.",
                      },
                      {
                        num: "3",
                        title: "If accepted",
                        desc: "You\u2019ll get all the details to confirm your spot.",
                      },
                    ].map((item) => (
                      <div key={item.num} className="flex gap-4 py-4 border-b border-slate-100 last:border-0">
                        <span className="font-serif text-2xl font-bold text-slate-200 flex-shrink-0 w-6">
                          {item.num}
                        </span>
                        <div>
                          <h3 className="font-medium text-slate-900 text-sm mb-0.5">{item.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="px-10 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
