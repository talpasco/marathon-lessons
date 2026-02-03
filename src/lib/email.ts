import { Resend } from "resend";

interface SendLessonEmailParams {
  to: string;
  firstName: string;
  zoomLink: string;
}

export async function sendLessonEmail({ to, firstName, zoomLink }: SendLessonEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("Resend API key not configured - skipping email send");
    console.log(`Would send email to ${to} with zoom link: ${zoomLink}`);
    return { id: "mock-email-id" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: "שיעורי מרתון עם רועי <noreply@yourdomain.com>", // Replace with your verified domain
    to: [to],
    subject: "קישור לשיעור המרתון שלך",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">שלום ${firstName}!</h1>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          תודה על ההשתתפות בשיעור המרתון עם רועי.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          מצורף קישור להצטרפות לשיעור, הלינק הינו אישי, ויש להירשם לשיעור מראש.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          אבקש להצטרף בזמן. נתראה!
        </p>

        <div style="margin: 30px 0;">
          <a href="${zoomLink}"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
            הצטרף לשיעור בזום
          </a>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          קישור ישיר: <a href="${zoomLink}" style="color: #2563eb;">${zoomLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #999; font-size: 12px;">
          מייל זה נשלח אוטומטית מאתר שיעורי המרתון עם רועי.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }

  return data;
}
