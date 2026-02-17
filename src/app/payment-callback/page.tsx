"use client";

import { useEffect } from "react";

export default function PaymentCallbackPage() {
  useEffect(() => {
    // Notify the parent window (if inside an iframe) that payment is complete
    if (window.parent !== window) {
      window.parent.postMessage({ type: "PAYMENT_SUCCESS" }, "*");
    }
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
          התשלום בוצע בהצלחה
        </p>
      </div>
    </div>
  );
}
