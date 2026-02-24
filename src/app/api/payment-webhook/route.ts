import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/process-payment";
import { sendEmail } from "@/lib/email";

// Extract lessonId from paymentdetails string
// Format: "מרתון קבוצתי - LESSON_TITLE [LESSON_ID]"
function extractLessonId(paymentdetails: string): string {
  const match = paymentdetails.match(/\[([^\]]+)\]/);
  return match ? match[1] : "";
}

// Parse params from various formats Upay might send
async function parseUpayParams(request: NextRequest): Promise<Record<string, string>> {
  const params: Record<string, string> = {};

  // Try URL search params (GET-style or query string on POST)
  const url = new URL(request.url);
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }

  // Try form-encoded body (POST with application/x-www-form-urlencoded)
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const body = await request.text();
      const formParams = new URLSearchParams(body);
      for (const [key, value] of formParams.entries()) {
        params[key] = value;
      }
    } catch (e) {
      console.error("Failed to parse form body:", e);
    }
  }

  // Try JSON body
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === "string" || typeof value === "number") {
          params[key] = String(value);
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON body:", e);
    }
  }

  return params;
}

async function handleWebhook(request: NextRequest) {
  try {
    const params = await parseUpayParams(request);
    console.log("Webhook received params:", JSON.stringify(params, null, 2));

    // Send raw debug email for every webhook call (so we can see what Upay sends)
    sendEmail({
      to: "tal.galmor3@gmail.com",
      subject: "Upay Webhook (IPN) - Raw Params",
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>Upay Webhook (IPN) Parameters</h2>
          <p>Method: ${request.method}</p>
          <p>Content-Type: ${request.headers.get("content-type") || "none"}</p>
          <p>Received at: ${new Date().toISOString()}</p>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(params, null, 2)}</pre>
          <h3>Individual params:</h3>
          <ul>
            ${Object.entries(params).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join("\n            ")}
          </ul>
        </div>
      `,
    }).catch((err: unknown) => console.error("Failed to send webhook debug email:", err));

    const errordescription = params.errordescription || "";

    // Only process successful payments
    if (errordescription !== "SUCCESS") {
      console.log("Webhook: payment not successful, errordescription:", errordescription);
      return NextResponse.json({ received: true, status: "not_success" });
    }

    // Extract lessonId — try direct param first, then from paymentdetails
    const lessonId = params.lessonId || extractLessonId(params.paymentdetails || "");
    const email = params.emailnotify || params.user_email || "";
    const transactionId = params.transactionid || "";

    const result = await processPayment({
      transactionId,
      email,
      name: params.cardownername || "",
      phone: params.cellphonenotify || "",
      lessonId,
      amount: params.amount || "",
      productdescription: params.productdescription || "",
    });

    console.log("Webhook processPayment result:", result);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle both GET and POST — Upay may use either
export async function POST(request: NextRequest) {
  return handleWebhook(request);
}

export async function GET(request: NextRequest) {
  return handleWebhook(request);
}
