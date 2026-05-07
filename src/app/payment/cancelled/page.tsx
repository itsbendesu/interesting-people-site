import Link from "next/link";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-12 sm:p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
          <span className="text-2xl text-stone-400">&#x21A9;</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Payment Cancelled</h1>
        <p className="text-base text-stone-600 leading-relaxed">
          No worries — your spot is still reserved. You can complete payment anytime using the link in your acceptance email.
        </p>
        <p className="text-sm text-stone-400 mt-2 leading-relaxed break-words">
          If you have any questions, email <a href="mailto:hello@interestingpeople.com" className="text-blue-600 hover:underline break-all">hello@interestingpeople.com</a>.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-4 text-base text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to interestingpeople.com
          </Link>
        </div>
      </div>
    </div>
  );
}
