import { redirect } from "next/navigation";
import { processPayment } from "@/lib/process-payment";
import { sendEmail } from "@/lib/email";

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
  const transactionid = getParam("transactionid");

  // Log all params for debugging
  const allParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    allParams[key] = Array.isArray(value) ? value[0] || "" : value || "";
  }
  console.log("Payment callback params (server):", JSON.stringify(allParams, null, 2));

  // Send debug email (non-blocking)
  sendEmail({
    to: "tal.galmor3@gmail.com",
    subject: "Upay Callback (returnurl) - Debug",
    html: `
      <div style="font-family: monospace; padding: 20px;">
        <h2>Upay Callback Parameters (returnurl)</h2>
        <p>Received at: ${new Date().toISOString()}</p>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(allParams, null, 2)}</pre>
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

  // ===== Payment SUCCESS — process with idempotency =====
  // If the webhook (ipnurl) already processed this transaction, processPayment
  // will detect the duplicate and skip — no double bookings or double emails.
  const result = await processPayment({
    transactionId: transactionid,
    email: userEmail,
    name: getParam("cardownername"),
    phone: getParam("cellphonenotify"),
    lessonId,
    amount: getParam("amount"),
    productdescription: getParam("productdescription"),
  });

  console.log("Callback processPayment result:", result);

  // Redirect to success page
  redirect("/payment-success");
}
