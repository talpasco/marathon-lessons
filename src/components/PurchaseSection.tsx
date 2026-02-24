"use client";

import Link from "next/link";

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
  price,
  upayLink,
}: PurchaseSectionProps) {
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

      {/* Payment Button - navigates to dedicated payment page */}
      <Link
        href={`/pay/${lessonId}`}
        className="block w-full py-4 px-6 rounded-lg font-semibold text-white text-center bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        לתשלום - {price} ₪
      </Link>

      <p className="text-xs text-gray-500 text-center mt-4">
        התשלום מאובטח באמצעות Upay
      </p>
    </div>
  );
}
