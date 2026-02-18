import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { params } = await request.json();

    console.log("Upay callback params received:", params);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("Resend API key not configured - skipping debug email");
      console.log("Would send callback params to tal.galmor3@gmail.com:", params);
      return NextResponse.json({ success: true, note: "no api key" });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "שיעורי מרתון עם רועי <onboarding@resend.dev>",
      to: ["tal.galmor3@gmail.com"],
      subject: "Upay Callback Params - Debug",
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>Upay Callback Parameters</h2>
          <p>Received at: ${new Date().toISOString()}</p>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(params, null, 2)}</pre>
          <h3>Individual params:</h3>
          <ul>
            ${Object.entries(params).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join("\n            ")}
          </ul>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send debug email:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in log-callback-params:", error);
    return NextResponse.json({ error: "Failed to log params" }, { status: 500 });
  }
}
