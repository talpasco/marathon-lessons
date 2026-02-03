import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent } from "@/lib/content";
import PurchaseSection from "@/components/PurchaseSection";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const content = await getContent();
  const lesson = content.lessons.find((l) => l.id === id);

  if (!lesson) {
    notFound();
  }

  const features = lesson.pageContent?.features || [
    "שיעור חי בזום",
    "תרגול אינטנסיבי",
    "מענה על שאלות בזמן אמת",
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
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
          חזרה לכל השיעורים
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lesson Details */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {lesson.title}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {lesson.date} בשעה {lesson.time}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {lesson.examPeriod}, {lesson.section}
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                פרטי השיעור
              </h2>
              <ul className="space-y-3 text-gray-700">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 ml-3"
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
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <PurchaseSection
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                lessonDate={lesson.date}
                lessonTime={lesson.time}
                price={lesson.price}
                upayLink={lesson.upayLink || ""}
                zoomLink={lesson.zoomLink}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
