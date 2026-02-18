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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePayment = () => {
    // Show modal
    setShowPaymentModal(true);

    // Submit form after a short delay to ensure iframe is mounted
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit();
      }
    }, 100);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
  };

  // Listen for payment success message from the iframe callback page
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "PAYMENT_SUCCESS") {
        const params = event.data.params;
        console.log("Upay return params:", params);
        setShowPaymentModal(false);

        // Use the email from Upay's callback (user_email = what user entered in Upay iframe)
        const userEmail = params.user_email || params.emailnotify;

        if (userEmail) {
          try {
            await fetch("/api/send-lesson-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userEmail,
                lessonTitle,
                lessonDate,
                lessonTime,
                zoomLink,
              }),
            });
          } catch (error) {
            console.error("Failed to send lesson email:", error);
          }
        }

        window.location.href = "/payment-success";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lessonTitle, lessonDate, lessonTime, zoomLink]);

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

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          className="block w-full py-4 px-6 rounded-lg font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          לתשלום - {price} ₪
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          התשלום מאובטח באמצעות Upay
        </p>
      </div>

      {/* Upay Form - exactly as provided by Upay */}
      <form
        ref={formRef}
        name="upayform"
        action="https://app.upay.co.il/API6/clientsecure/redirectpage.php"
        method="post"
        target="upay_iframe"
        style={{ display: "none" }}
      >
        <input type="hidden" value="roeedo@gmail.com" name="email" />
        <input type="hidden" value={price.toString()} name="amount" />
        <input type="hidden" value={`https://marathon-lessons.vercel.app/payment-callback?lessonId=${encodeURIComponent(lessonId)}`} name="returnurl" />
        <input type="hidden" value="" name="ipnurl" />
        <input type="hidden" value="מרתון קבוצתי" name="paymentdetails" />
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
          {/* Backdrop - light grey transparent */}
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-30"
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
