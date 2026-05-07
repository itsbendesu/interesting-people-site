import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Interesting People",
  description: "How we handle your data and video submissions",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-slate-900 tracking-tight inline-flex items-center min-h-[44px]">
            IP4
          </Link>
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 md:py-20">

        <h1 className="text-[2rem] leading-tight sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 sm:mb-6">Privacy Policy</h1>

        <p className="text-base sm:text-lg text-slate-500 mb-10 sm:mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 sm:space-y-12">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">What We Collect</h2>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">
              When you apply, we collect the following information:
            </p>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Contact information:</strong> Name, email address, location, and timezone</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Profile information:</strong> A short bio and optional links you provide</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Video submission:</strong> A video response to one of our prompts (up to 90 seconds)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Technical data:</strong> IP address and submission timestamp for security purposes</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">How We Use Your Data</h2>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">Your information is used to:</p>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Review your application:</strong> Our team watches your video to evaluate your application</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Contact you:</strong> To communicate our decision and event details if accepted</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Prevent abuse:</strong> To detect spam and protect the integrity of our application process</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Video Handling</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
              <ul className="space-y-4 text-base">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-600">Videos are stored securely on Cloudflare R2 (encrypted at rest)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-600">Videos are only viewable by our review team</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-600">Videos are never shared publicly or with third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-600">Videos from rejected applications are deleted after 90 days</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Internal Review Process</h2>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">
              Your application is reviewed by our team using the following process:
            </p>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span>Each application is watched by at least one human reviewer</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span>Reviewers score applications on curiosity, participation, and emotional intelligence</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span>Scores and notes are used internally to make acceptance decisions</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span>Review data is not shared outside our organization</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Data Retention</h2>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Accepted applicants:</strong> Data retained for the duration of your participation plus 1 year</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Waitlisted applicants:</strong> Data retained for 1 year for potential future consideration</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Rejected applicants:</strong> Data deleted within 90 days of rejection</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Incomplete applications:</strong> Deleted after 24 hours</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Your Rights</h2>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">You have the right to:</p>
            <ul className="space-y-3 text-base text-slate-600">
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Access:</strong> Request a copy of your data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Correction:</strong> Request correction of inaccurate information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Deletion:</strong> Request deletion of your data (subject to legal requirements)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400">—</span>
                <span><strong className="text-slate-900">Withdrawal:</strong> Withdraw your application at any time before a decision is made</span>
              </li>
            </ul>
            <p className="text-base text-slate-600 mt-4 leading-relaxed">
              To exercise these rights, contact us by replying to your application confirmation email.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Security</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data,
              including encryption in transit (TLS) and at rest, access controls, and secure
              authentication for our review team.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Changes to This Policy</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              We may update this policy from time to time. Significant changes will be communicated
              via email to applicants with active applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Contact</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              For privacy-related questions or concerns, please contact us by replying to your
              application confirmation email or emailing our team directly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
