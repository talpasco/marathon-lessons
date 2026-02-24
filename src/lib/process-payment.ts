import { addBooking, bookingExists } from "@/lib/bookings";
import { getContent } from "@/lib/content";
import { sendLessonEmail, sendEmail } from "@/lib/email";
import { Booking } from "@/types/content";

interface PaymentParams {
  transactionId: string;
  email: string;
  name: string;
  phone: string;
  lessonId: string;
  amount: string;
  productdescription: string;
}

interface ProcessResult {
  alreadyProcessed: boolean;
  bookingSaved: boolean;
  emailSent: boolean;
  error?: string;
}

export async function processPayment(params: PaymentParams): Promise<ProcessResult> {
  const { transactionId, email, name, phone, lessonId, amount, productdescription } = params;

  // Idempotency check — skip if this transaction was already processed
  if (transactionId) {
    const exists = await bookingExists(transactionId);
    if (exists) {
      console.log("Transaction already processed, skipping:", transactionId);
      return { alreadyProcessed: true, bookingSaved: false, emailSent: false };
    }
  }

  let bookingSaved = false;
  let emailSent = false;

  try {
    // 1. Get lesson info
    const content = await getContent();
    const lesson = lessonId ? content.lessons.find((l) => l.id === lessonId) : null;

    // 2. Save booking
    const booking: Booking = {
      id: `booking-${Date.now()}-${transactionId}`,
      email,
      name,
      phone,
      lessonId,
      lessonTitle: lesson?.title || productdescription || "",
      zoomLink: lesson?.zoomLink || "",
      transactionId,
      amount,
      timestamp: new Date().toISOString(),
    };

    await addBooking(booking);
    bookingSaved = true;
    console.log("Booking saved:", booking.id);

    // 3. Send lesson email
    if (email && lesson) {
      try {
        await sendLessonEmail({
          to: email,
          lessonTitle: lesson.title,
          lessonDate: lesson.date,
          lessonTime: lesson.time,
          zoomLink: lesson.zoomLink,
          template: content.emailTemplate,
        });
        emailSent = true;
        console.log("Lesson email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send lesson email:", emailError);
      }
    } else {
      console.warn("Skipping email — email:", email, "lesson found:", !!lesson);
    }

    // 4. Send debug email (non-blocking)
    sendEmail({
      to: "tal.galmor3@gmail.com",
      subject: `Payment Processed - ${lesson?.title || lessonId} - ${email || "no email"}`,
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>Payment Processed</h2>
          <p>Source: ${params.transactionId ? "Upay" : "Unknown"}</p>
          <p>Time: ${new Date().toISOString()}</p>
          <p>Booking saved: ${bookingSaved}</p>
          <p>Email sent: ${emailSent}</p>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${JSON.stringify(params, null, 2)}</pre>
        </div>
      `,
    }).catch((err: unknown) => console.error("Failed to send debug email:", err));

    return { alreadyProcessed: false, bookingSaved, emailSent };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      alreadyProcessed: false,
      bookingSaved,
      emailSent,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
