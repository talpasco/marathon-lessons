import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-12 lg:px-24 flex items-center justify-center">
      <div className="max-w-xl w-full text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            תודה רבה!
          </h1>

          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            התשלום נקלט בהצלחה.
            <br />
            קישור לשיעור והמלצות לקראת השיעור נשלחו אליך במייל.
            <br />
            נתראה בשיעור!
          </p>

          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            חזרה לעמוד הראשי
          </Link>
        </div>
      </div>
    </main>
  );
}
