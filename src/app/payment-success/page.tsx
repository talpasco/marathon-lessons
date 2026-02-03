import Link from "next/link";
import { sendLessonEmail } from "@/lib/email";
import lessonsData from "@/data/lessons.json";

interface PageProps {
  searchParams: Promise<{
    lessonId?: string;
    email?: string;
    name?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { lessonId, email, name } = params;

  // Send email if all params are present (backup for webhook)
  if (lessonId && email && name) {
    const lesson = lessonsData.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      try {
        const firstName = decodeURIComponent(name).split(" ")[0];
        await sendLessonEmail({
          to: decodeURIComponent(email),
          firstName,
          zoomLink: lesson.zoomLink,
        });
      } catch (error) {
        console.error("Failed to send email on success page:", error);
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-12 lg:px-24 flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
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

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            התשלום בוצע בהצלחה!
          </h1>

          <p className="text-gray-600 mb-6">
            תודה על הרשמתך לשיעור המרתון. קישור לזום נשלח לכתובת המייל שלך.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              אנא בדוק את תיבת הדואר שלך (כולל תיקיית הספאם) לקבלת פרטי ההתחברות לשיעור.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            חזרה לעמוד הראשי
          </Link>
        </div>
      </div>
    </main>
  );
}
