import { NextRequest, NextResponse } from "next/server";
import { getContent } from "@/lib/content";

export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
  }

  try {
    const content = await getContent();
    const lesson = content.lessons.find((l) => l.id === lessonId);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({
      title: lesson.title,
      date: lesson.date,
      time: lesson.time,
      zoomLink: lesson.zoomLink,
    });
  } catch (error) {
    console.error("Error fetching lesson info:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
