import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center">
          <Link href="/" className="font-serif text-xl font-bold text-slate-900 tracking-tight inline-flex items-center min-h-[44px]">
            IP4
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12 sm:py-20 md:py-32">
        <div className="text-center mb-10 sm:mb-12">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-serif text-[2rem] leading-tight sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            You&apos;re in the queue.
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            Thanks for putting yourself out there. We watch every single video
            and will be in touch.
          </p>
        </div>

        <div className="space-y-0 mb-10 sm:mb-12">
          {[
            {
              step: "1",
              title: "We watch your video",
              desc: "A real human (not an AI) reviews every application. We look for curiosity, participation, and emotional intelligence.",
            },
            {
              step: "2",
              title: "We email you",
              desc: "Whether it's a yes, no, or waitlist\u2014we'll let you know. Check your inbox (and spam folder).",
            },
            {
              step: "3",
              title: "If accepted",
              desc: "You'll get all the details about the event\u2014dates, location, and how to confirm your spot.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 sm:gap-6 py-5 sm:py-6 border-b border-slate-100 last:border-0">
              <span className="font-serif text-3xl font-bold text-slate-200 flex-shrink-0 w-8">
                {item.step}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-slate-900 mb-1">{item.title}</h3>
                <p className="text-[15px] sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 text-center mb-10 sm:mb-12">
          <p className="text-base text-slate-500 mb-1">
            Questions? Reply to your confirmation email.
          </p>
          <p className="text-sm text-slate-400">
            We read those too.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 text-base text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
