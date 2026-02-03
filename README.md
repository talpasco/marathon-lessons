# שיעורי מרתון עם רועי

אתר לרישום ומכירת שיעורי מרתון לפסיכומטרי.

## התקנה מקומית

```bash
npm install
npm run dev
```

## הגדרת Environment Variables

צור קובץ `.env.local` עם הערכים הבאים:

```
UPAY_TERMINAL_ID=your_upay_terminal_id
UPAY_API_KEY=your_upay_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Deploy ל-Vercel

### שלב 1: העלאה ל-GitHub
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/marathon-lessons.git
git push -u origin main
```

### שלב 2: חיבור ל-Vercel
1. היכנס ל-[vercel.com](https://vercel.com)
2. לחץ "Add New" → "Project"
3. בחר את הריפו שהעלית
4. הוסף את ה-Environment Variables:
   - `UPAY_TERMINAL_ID`
   - `UPAY_API_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_BASE_URL` (כתובת ה-Vercel שתקבל)
5. לחץ "Deploy"

## ניהול שיעורים

לעריכת השיעורים, ערוך את הקובץ `src/data/lessons.json`:

```json
{
  "lessons": [
    {
      "id": "marathon-verbal-1",      // מזהה ייחודי (ישמש ב-URL)
      "title": "מרתון מילולי",         // שם השיעור
      "date": "יום שני ה09.02",        // תאריך
      "time": "19:00",                 // שעה
      "examPeriod": "מועד דצמבר 25",   // מועד הבחינה
      "section": "פרק שני",            // פרק
      "price": 70,                     // מחיר בשקלים
      "zoomLink": "https://zoom.us/j/YOUR_LINK",  // קישור זום
      "active": true                   // האם להציג (true/false)
    }
  ]
}
```

### הוספת שיעור חדש
הוסף אובייקט חדש למערך `lessons` עם כל השדות.

### הסרת שיעור
שנה את `active` ל-`false` או מחק את האובייקט מהמערך.

## הגדרת Resend

1. צור חשבון ב-[resend.com](https://resend.com)
2. הוסף ואמת דומיין (או השתמש בדומיין הטסט לפיתוח)
3. צור API Key
4. עדכן את הדומיין בקובץ `src/lib/email.ts` בשורה:
   ```typescript
   from: "שיעורי מרתון עם רועי <noreply@yourdomain.com>"
   ```

## הגדרת Upay

1. היכנס לחשבון Upay שלך
2. קבל Terminal ID ו-API Key
3. הגדר את Webhook URL להיות: `https://your-domain.vercel.app/api/payment-webhook`
4. הגדר את Success URL להיות: `https://your-domain.vercel.app/payment-success`

## עריכת טקסט בעמוד הראשי

לעריכת שלושת שורות הטקסט בעמוד הראשי, ערוך את הקובץ `src/app/page.tsx` ושנה את השורות:
```tsx
<p>שורה ראשונה של טקסט - ניתן לערוך בקובץ page.tsx</p>
<p>שורה שנייה של טקסט - ניתן לערוך בקובץ page.tsx</p>
<p>שורה שלישית של טקסט - ניתן לערוך בקובץ page.tsx</p>
```
