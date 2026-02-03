import Link from "next/link";
import lessonsData from "@/data/lessons.json";
import { Lesson } from "@/types/lesson";

export default function Home() {
  const lessons: Lesson[] = lessonsData.lessons.filter((lesson) => lesson.active);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            שיעורי מרתון עם רועי
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            בואו לשפר את היכולות לקראת הבחינה הפסיכומטרית הקרובה
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            מהם שיעורי המרתון?
          </h2>
          <div className="text-gray-700 space-y-2">
            <p>שורה ראשונה של טקסט - ניתן לערוך בקובץ page.tsx</p>
            <p>שורה שנייה של טקסט - ניתן לערוך בקובץ page.tsx</p>
            <p>שורה שלישית של טקסט - ניתן לערוך בקובץ page.tsx</p>
          </div>
        </header>

        {/* Lessons Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                {/* Icon Placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Lesson Info */}
                <p className="text-sm text-gray-500 mb-1">
                  {lesson.date} בשעה {lesson.time}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {lesson.examPeriod}, {lesson.section}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
