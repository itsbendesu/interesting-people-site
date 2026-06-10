"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  expiresAt: string;
}

function Nav() {
  return (
    <nav className="border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg text-stone-900 tracking-tight">
          Interesting People
          <sup className="text-blue-600 text-sm font-bold">4</sup>
        </Link>
      </div>
    </nav>
  );
}

export default function FinalizePage() {
  const params = useParams();
  const token = params.token as string;

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/apply/${token}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Application not found");
        }
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/apply/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <Nav />
        <div className="flex items-center justify-center px-6 py-24 md:py-32">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              You&apos;re in the queue.
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              A real human reads every application. We&apos;ll be in touch by email.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-white">
        <Nav />
        <div className="flex items-center justify-center px-6 py-24 md:py-32">
          <div className="max-w-md w-full text-center">
            <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Application Not Found
            </h1>
            <p className="text-slate-500 mb-8">
              {error || "This application may have expired or already been submitted."} You can start a fresh application anytime.
            </p>
            <Link
              href="/apply"
              className="inline-block px-8 py-3.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Start New Application
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <p className="text-sm text-slate-400 mb-2">Hi {application.name},</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          Good news: one less step.
        </h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          We&apos;ve dropped the last step of the application. Everything you already told us is saved, so all
          that&apos;s left is to hit the button below and your application is in.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full min-h-[56px] px-6 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            You can only submit your application once.
          </p>
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
          Application expires: {new Date(application.expiresAt).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
