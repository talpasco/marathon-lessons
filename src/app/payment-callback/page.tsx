import { redirect } from "next/navigation";
import { addBooking } from "@/lib/bookings";
import { getContent } from "@/lib/content";
import { sendLessonEmail, sendEmail } from "@/lib/email";
import { Booking } from "@/types/content";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentCallbackPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Convert all params to strings
  const getParam = (key: string): string => {
    const val = params[key];
    if (Array.isArray(val)) return val[0] || "";
    return val || "";
  };

  const errordescription = getParam("errordescription");
  const lessonId = getParam("lessonId");
  const userEmail = getParam("emailnotify") || getParam("user_email");
  const cardownername = getParam("cardownername");
  const cellphonenotify = getParam("cellphonenotify");
  const transactionid = getParam("transactionid");
  const amount = getParam("amount");
  const productdescription = getParam("productdescription");

  // Log all params for debugging
  const allParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    allParams[key] = Array.isArray(value) ? value[0] || "" : value || "";
  }
  console.log("Payment callback params (server):", JSON.stringify(allParams, null, 2));

  // Send debug email (non-blocking, fire and forget)
  sendEmail({
    to: "tal.galmor3@gmail.com",
    subject: "Upay Callback Params - Debug",
    html: `
      <div style="font-family: monospace; padding: 20px;">
        <h2>Upay Callback Parameters</h2>
        <p>Received at: ${new Date().toISOString()}</p>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(allParams, null, 2)}</pre>
        <h3>Individual params:</h3>
        <ul>
          ${Object.entries(allParams).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join("\n              ")}
        </ul>
      </div>
    `,
  }).catch((err: unknown) => console.error("Failed to send debug email:", err));

  // If payment failed, show error page
  if (errordescription !== "SUCCESS") {
    return (
      <div
        dir="rtl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Heebo, sans-serif",
          background: "#f9fafb",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.75rem" }}>
            שגיאה בתשלום
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", marginBottom: "1.5rem" }}>
            {errordescription || "התשלום נכשל"}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            חזרה לעמוד הראשי
          </a>
        </div>
      </div>
    );
  }

  // ===== Payment SUCCESS — process everything server-side =====
  try {
    // 1. Get lesson info from content
    const content = await getContent();
    const lesson = lessonId ? content.lessons.find((l) => l.id === lessonId) : null;

    // 2. Save booking (most important — records the payment)
    const booking: Booking = {
      id: `booking-${Date.now()}-${transactionid}`,
      email: userEmail,
      name: cardownername,
      phone: cellphonenotify,
      lessonId,
      lessonTitle: lesson?.title || productdescription || "",
      zoomLink: lesson?.zoomLink || "",
      transactionId: transactionid,
      amount,
      timestamp: new Date().toISOString(),
    };

    await addBooking(booking);
    console.log("Booking saved successfully:", booking.id);

    // 3. Send lesson email to the paying customer
    if (userEmail && lesson) {
      try {
        await sendLessonEmail({
          to: userEmail,
          lessonTitle: lesson.title,
          lessonDate: lesson.date,
          lessonTime: lesson.time,
          zoomLink: lesson.zoomLink,
          template: content.emailTemplate,
        });
        console.log("Lesson email sent successfully to:", userEmail);
      } catch (emailError) {
        console.error("Failed to send lesson email:", emailError);
        // Don't fail the whole flow if email fails — payment already went through
      }
    } else {
      console.warn("Skipping lesson email — userEmail:", userEmail, "lesson found:", !!lesson);
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);
    // Still redirect to success — the payment itself went through at Upay
  }

  // 4. Redirect to success page
  redirect("/payment-success");
}
