"use client";

import { useState, useEffect } from "react";

interface PurchaseFormProps {
  lessonId: string;
  lessonTitle: string;
  price: number;
}

declare global {
  interface Window {
    Upay?: {
      init: (config: {
        terminalId: string;
        amount: number;
        currency: string;
        successCallback: (response: { transactionId: string }) => void;
        errorCallback: (error: { message: string }) => void;
      }) => void;
      open: () => void;
    };
  }
}

export default function PurchaseForm({ lessonId, lessonTitle, price }: PurchaseFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = fullName.trim().length > 0 && isValidEmail(email);

  useEffect(() => {
    // Load Upay script
    const script = document.createElement("script");
    script.src = "https://www.upay.co.il/api/v2/upay.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("נא למלא את כל השדות בצורה תקינה");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create payment session on server
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          fullName,
          email,
          amount: price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה ביצירת התשלום");
      }

      // Redirect to Upay payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעיבוד התשלום");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          התשלום בוצע בהצלחה!
        </h3>
        <p className="text-gray-600">
          קישור לזום נשלח לכתובת המייל שלך
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          שם מלא
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="הכנס את שמך המלא"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          כתובת מייל
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="example@email.com"
          dir="ltr"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
          isFormValid && !isLoading
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? "מעבד..." : `לתשלום - ${price} ₪`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        התשלום מאובטח באמצעות Upay
      </p>
    </form>
  );
}
