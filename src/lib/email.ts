import { Resend } from "resend";

interface SendLessonEmailParams {
  to: string;
  lessonTitle: string;
  lessonDate: string;
  lessonTime: string;
  zoomLink: string;
}

export async function sendLessonEmail({
  to,
  lessonTitle,
  lessonDate,
  lessonTime,
  zoomLink,
}: SendLessonEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("Resend API key not configured - skipping email send");
    console.log(`Would send email to ${to} with zoom link: ${zoomLink}`);
    return { id: "mock-email-id" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: "שיעורי מרתון עם רועי <onboarding@resend.dev>",
    to: [to],
    subject: `פרטי השיעור - ${lessonTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">תודה רבה!</h1>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          התשלום נקלט בהצלחה.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          להלן פרטי השיעור:
        </p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>שיעור:</strong> ${lessonTitle}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>תאריך:</strong> ${lessonDate}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>שעה:</strong> ${lessonTime}</p>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          קישור להצטרפות לשיעור בזום:
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

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          נתראה בשיעור!
        </p>

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
