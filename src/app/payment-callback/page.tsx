"use client";

import { useEffect, useState } from "react";

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function processPayment() {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      console.log("Upay callback params:", JSON.stringify(params, null, 2));

      // Check if payment was successful
      if (params.errordescription !== "SUCCESS") {
        setStatus("error");
        setErrorMessage(params.errordescription || "התשלום נכשל");
        return;
      }

      const userEmail = params.emailnotify || params.user_email;
      const lessonId = params.lessonId;

      try {
        // 1. Save booking first (most important - this records the payment)
        await fetch("/api/save-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        });
        console.log("Booking saved successfully");

        // 2. Send email with lesson details
        if (userEmail && lessonId) {
          const lessonRes = await fetch(`/api/lesson-info?lessonId=${encodeURIComponent(lessonId)}`);
          const lesson = await lessonRes.json();

          if (lesson.title) {
            await fetch("/api/send-lesson-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userEmail,
                lessonTitle: lesson.title,
                lessonDate: lesson.date,
                lessonTime: lesson.time,
                zoomLink: lesson.zoomLink,
              }),
            });
            console.log("Email sent successfully to", userEmail);
          }
        }

        // 3. Log callback params (debug - non-blocking)
        fetch("/api/log-callback-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        }).catch((err) => console.error("Failed to log callback params:", err));

        // All done - redirect to success page
        setStatus("success");
        window.location.href = "/payment-success";
      } catch (error) {
        console.error("Error processing payment callback:", error);
        // Even on error, try to redirect - the payment itself went through
        setStatus("success");
        window.location.href = "/payment-success";
      }
    }

    processPayment();
  }, []);

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
        {status === "processing" && (
          <>
            {/* Spinner */}
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #2563eb",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem",
              }}
            />
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              מעבד את התשלום...
            </h1>
            <p style={{ fontSize: "1rem", color: "#4b5563" }}>
              אנא המתן, אל תסגור את הדף
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === "error" && (
          <>
            {/* Error Icon */}
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
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              שגיאה בתשלום
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#4b5563", marginBottom: "1.5rem" }}>
              {errorMessage}
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
          </>
        )}

        {status === "success" && (
          <>
            {/* Checkmark */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "0.75rem",
              }}
            >
              תודה רבה!
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#4b5563" }}>
              מעביר אותך...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
