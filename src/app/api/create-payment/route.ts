import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, fullName, email, amount } = body;

    if (!lessonId || !fullName || !email || !amount) {
      return NextResponse.json(
        { error: "חסרים פרטים" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "כתובת מייל לא תקינה" },
        { status: 400 }
      );
    }

    const UPAY_TERMINAL_ID = process.env.UPAY_TERMINAL_ID;
    const UPAY_API_KEY = process.env.UPAY_API_KEY;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!UPAY_TERMINAL_ID || !UPAY_API_KEY) {
      console.error("Missing Upay credentials");
      return NextResponse.json(
        { error: "שגיאה בהגדרות המערכת" },
        { status: 500 }
      );
    }

    // Create payment request with Upay
    // Note: This is a simplified example. You'll need to adjust based on Upay's actual API
    const upayResponse = await fetch("https://www.upay.co.il/api/v2/createPayment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${UPAY_API_KEY}`,
      },
      body: JSON.stringify({
        terminalId: UPAY_TERMINAL_ID,
        amount: amount * 100, // Convert to agorot
        currency: "ILS",
        description: `שיעור מרתון - ${lessonId}`,
        successUrl: `${BASE_URL}/payment-success?lessonId=${lessonId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}`,
        cancelUrl: `${BASE_URL}/lesson/${lessonId}`,
        webhookUrl: `${BASE_URL}/api/payment-webhook`,
        customerEmail: email,
        customerName: fullName,
        metadata: {
          lessonId,
          fullName,
          email,
        },
      }),
    });

    if (!upayResponse.ok) {
      const errorData = await upayResponse.text();
      console.error("Upay error:", errorData);
      return NextResponse.json(
        { error: "שגיאה ביצירת התשלום" },
        { status: 500 }
      );
    }

    const upayData = await upayResponse.json();

    return NextResponse.json({
      paymentUrl: upayData.paymentUrl,
      transactionId: upayData.transactionId,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "שגיאה בעיבוד הבקשה" },
      { status: 500 }
    );
  }
}
