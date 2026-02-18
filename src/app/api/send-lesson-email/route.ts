import { NextResponse } from "next/server";
import { sendLessonEmail } from "@/lib/email";
import { getContent } from "@/lib/content";

export async function POST(request: Request) {
  try {
    const { email, lessonTitle, lessonDate, lessonTime, zoomLink } =
      await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Fetch email template from site content
    const content = await getContent();
    const template = content.emailTemplate;

    await sendLessonEmail({
      to: email,
      lessonTitle,
      lessonDate,
      lessonTime,
      zoomLink,
      template,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
