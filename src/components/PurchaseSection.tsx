"use client";

import { useState, useRef, useEffect } from "react";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Submit form to iframe when modal opens
  useEffect(() => {
    if (showPaymentModal && formRef.current) {
      formRef.current.submit();
    }
  }, [showPaymentModal]);

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

      // Show modal and submit form to iframe
      setShowPaymentModal(true);

    } catch (err) {
      console.error("Error:", err);
      setError("שגיאה בשליחת המייל, נסה שוב");
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setIsLoading(false);
  };

  if (!upayLink) {
    return (
      <div className="text-center text-gray-500 py-4">
        התשלום אינו זמין כרגע
      </div>
    );
  }

  return (
    <>
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

      {/* Hidden Upay Form - exactly as provided by Upay */}
      <form
        ref={formRef}
        name="upayform"
        action="https://app.upay.co.il/API6/clientsecure/redirectpage.php"
        method="post"
        target="upay_iframe"
        style={{ display: "none" }}
      >
        <input type="hidden" value={email} name="email" />
        <input type="hidden" value={price.toString()} name="amount" />
        <input type="hidden" value="" name="returnurl" />
        <input type="hidden" value="" name="ipnurl" />
        <input type="hidden" value={`${lessonTitle} - ${lessonDate}`} name="paymentdetails" />
        <input type="hidden" value="1" name="maxpayments" />
        <input type="hidden" value="1" name="livesystem" />
        <input type="hidden" value="" name="commissionreduction" />
        <input type="hidden" value="0" name="createinvoiceandreceipt" />
        <input type="hidden" value="0" name="createinvoice" />
        <input type="hidden" value="0" name="createreceipt" />
        <input type="hidden" value="UPAY" name="refername" />
        <input type="hidden" value="HE" name="lang" />
        <input type="hidden" value="NIS" name="currency" />
      </form>

      {/* Payment Modal with iframe */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">תשלום מאובטח</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-2"
              >
                ×
              </button>
            </div>

            {/* Iframe for Upay payment */}
            <iframe
              name="upay_iframe"
              className="w-full h-[600px] border-0"
              title="Upay Payment"
            />
          </div>
        </div>
      )}
    </>
  );
}
