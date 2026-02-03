"use client";

import { useState } from "react";

interface PurchaseSectionProps {
  lessonId: string;
  lessonTitle: string;
  lessonDate: string;
  lessonTime: string;
  price: number;
  upayLink: string;
  zoomLink: string;
}

export default function PurchaseSection({
  lessonId,
  lessonTitle,
  lessonDate,
  lessonTime,
  price,
  upayLink,
  zoomLink,
}: PurchaseSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    // Validate email
    if (!email || !email.includes("@")) {
      setError("נא להזין כתובת אימייל תקינה");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Send email with lesson details
      const response = await fetch("/api/send-lesson-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lessonId,
          lessonTitle,
          lessonDate,
          lessonTime,
          zoomLink,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      // Open Upay payment in new tab
      window.open(upayLink, "_blank");

    } catch (err) {
      console.error("Error:", err);
      setError("שגיאה בשליחת המייל, נסה שוב");
    } finally {
      setIsLoading(false);
    }
  };

  if (!upayLink) {
    return (
      <div className="text-center text-gray-500 py-4">
        התשלום אינו זמין כרגע
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-gray-900">{price} ₪</span>
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          כתובת אימייל לקבלת פרטי השיעור
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          dir="ltr"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="block w-full py-4 px-6 rounded-lg font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "שולח..." : `לתשלום - ${price} ₪`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        התשלום מאובטח באמצעות Upay
      </p>
    </div>
  );
}
