import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { params } = await request.json();

    console.log("Upay callback params received:", params);

    await sendEmail({
      to: "tal.galmor3@gmail.com",
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in log-callback-params:", error);
    return NextResponse.json({ error: "Failed to log params" }, { status: 500 });
  }
}
