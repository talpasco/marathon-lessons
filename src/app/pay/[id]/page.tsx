import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayPage({ params }: PageProps) {
  const { id } = await params;
  const content = await getContent();
  const lesson = content.lessons.find((l) => l.id === id);

  if (!lesson || !lesson.active) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://marathon-lessons.vercel.app";
  const returnUrl = `${baseUrl}/payment-callback?lessonId=${encodeURIComponent(lesson.id)}`;
  const ipnUrl = `${baseUrl}/api/payment-webhook?lessonId=${encodeURIComponent(lesson.id)}`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/lesson/${lesson.id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          חזרה לשיעור
        </Link>

        {/* Lesson Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            תשלום עבור {lesson.title}
          </h1>
          <p className="text-gray-600 mb-1">
            {lesson.date} בשעה {lesson.time}
          </p>
          <p className="text-gray-600 mb-4">
            {lesson.examPeriod}, {lesson.section}
          </p>
          <div className="text-3xl font-bold text-gray-900">
            {lesson.price} ₪
          </div>
        </div>

        {/* Upay Payment Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            תשלום מאובטח
          </h2>

          <form
            name="upayform"
            action="https://app.upay.co.il/API6/clientsecure/redirectpage.php"
            method="post"
          >
            <input type="hidden" value="roeedo@gmail.com" name="email" />
            <input type="hidden" value={lesson.price.toString()} name="amount" />
            <input type="hidden" value={returnUrl} name="returnurl" />
            <input type="hidden" value={ipnUrl} name="ipnurl" />
            <input type="hidden" value={`מרתון קבוצתי - ${lesson.title} [${lesson.id}]`} name="paymentdetails" />
            <input type="hidden" value="1" name="maxpayments" />
            <input type="hidden" value="1" name="livesystem" />
            <input type="hidden" value="" name="commissionreduction" />
            <input type="hidden" value="0" name="createinvoiceandreceipt" />
            <input type="hidden" value="0" name="createinvoice" />
            <input type="hidden" value="0" name="createreceipt" />
            <input type="hidden" value="UPAY" name="refername" />
            <input type="hidden" value="HE" name="lang" />
            <input type="hidden" value="NIS" name="currency" />

            <button
              type="submit"
              className="block w-full py-4 px-6 rounded-lg font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 transition-colors text-lg"
            >
              המשך לתשלום - {lesson.price} ₪
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            התשלום מאובטח באמצעות Upay
          </p>
        </div>
      </div>
    </main>
  );
}
