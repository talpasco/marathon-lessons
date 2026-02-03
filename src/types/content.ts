export interface SiteContent {
  homepage: {
    title: string;
    subtitle: string;
    sectionTitle: string;
    description: string[];
  };
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  date: string;
  time: string;
  examPeriod: string;
  section: string;
  price: number;
  zoomLink: string;
  active: boolean;
  imageUrl?: string;
  pageContent?: {
    features: string[];
  };
}

export const defaultContent: SiteContent = {
  homepage: {
    title: "שיעורי מרתון עם רועי",
    subtitle: "בואו לשפר את היכולות לקראת הבחינה הפסיכומטרית הקרובה",
    sectionTitle: "מהם שיעורי המרתון?",
    description: [
      "שורה ראשונה של טקסט - ניתן לערוך בפאנל הניהול",
      "שורה שנייה של טקסט - ניתן לערוך בפאנל הניהול",
      "שורה שלישית של טקסט - ניתן לערוך בפאנל הניהול",
    ],
  },
  lessons: [
    {
      id: "marathon-verbal-1",
      title: "מרתון מילולי",
      date: "יום שני ה09.02",
      time: "19:00",
      examPeriod: "מועד דצמבר 25",
      section: "פרק שני",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_ZOOM_LINK_1",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    },
    {
      id: "marathon-quant-1",
      title: "מרתון כמותי",
      date: "יום רביעי ה11.02",
      time: "20:00",
      examPeriod: "מועד דצמבר 25",
      section: "פרק ראשון",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_ZOOM_LINK_2",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    },
    {
      id: "marathon-english-1",
      title: "מרתון אנגלית",
      date: "יום חמישי ה12.02",
      time: "18:30",
      examPeriod: "מועד דצמבר 25",
      section: "פרק שלישי",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_ZOOM_LINK_3",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    },
    {
      id: "marathon-verbal-2",
      title: "מרתון מילולי",
      date: "יום ראשון ה15.02",
      time: "19:00",
      examPeriod: "מועד דצמבר 25",
      section: "פרק רביעי",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_ZOOM_LINK_4",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    },
    {
      id: "marathon-quant-2",
      title: "מרתון כמותי",
      date: "יום שלישי ה17.02",
      time: "20:00",
      examPeriod: "מועד דצמבר 25",
      section: "פרק חמישי",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_ZOOM_LINK_5",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    },
  ],
};
