import { NextResponse } from "next/server";
import { addBooking } from "@/lib/bookings";
import { getContent } from "@/lib/content";
import { Booking } from "@/types/content";

export async function POST(request: Request) {
  try {
    const { params } = await request.json();

    const email = params.emailnotify || params.user_email || "";
    const name = params.cardownername || "";
    const phone = params.cellphonenotify || "";
    const transactionId = params.transactionid || "";
    const amount = params.amount || "";
    const lessonId = params.lessonId || "";

    // Get lesson title from content
    let lessonTitle = "";
    let zoomLink = "";
    if (lessonId) {
      const content = await getContent();
      const lesson = content.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        lessonTitle = lesson.title;
        zoomLink = lesson.zoomLink;
      }
    }

    const booking: Booking = {
      id: `booking-${Date.now()}-${transactionId}`,
      email,
      name,
      phone,
      lessonId,
      lessonTitle: lessonTitle || params.productdescription || "",
      zoomLink,
      transactionId,
      amount,
      timestamp: new Date().toISOString(),
    };

    await addBooking(booking);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving booking:", error);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }
}
