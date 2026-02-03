import { NextRequest, NextResponse } from "next/server";
import { sendLessonEmail } from "@/lib/email";
import { getContent } from "@/lib/content";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (you should implement this based on Upay's documentation)
    // const signature = request.headers.get("x-upay-signature");
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { status, metadata } = body;

    // Only process successful payments
    if (status !== "success" && status !== "completed") {
      return NextResponse.json({ received: true });
    }

    const { lessonId, fullName, email } = metadata;

    // Find the lesson to get the Zoom link
    const content = await getContent();
    const lesson = content.lessons.find((l) => l.id === lessonId);

    if (!lesson) {
      console.error("Lesson not found:", lessonId);
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Send email with Zoom link
    await sendLessonEmail({
      to: email,
      lessonTitle: lesson.title,
      lessonDate: lesson.date,
      lessonTime: lesson.time,
      zoomLink: lesson.zoomLink,
    });

    console.log(`Email sent to ${email} for lesson ${lessonId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
