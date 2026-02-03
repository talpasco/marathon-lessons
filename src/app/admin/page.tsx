"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteContent, Lesson, defaultContent } from "@/types/content";

export default function AdminDashboard() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"homepage" | "lessons">("homepage");
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/admin/content");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setMessage("השינויים נשמרו בהצלחה!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("שגיאה בשמירה");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setMessage("שגיאה בשמירה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const updateHomepage = (field: string, value: string | string[]) => {
    setContent((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [field]: value,
      },
    }));
  };

  const updateLesson = (lessonId: string, field: string, value: string | number | boolean | string[]) => {
    setContent((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
      ),
    }));
  };

  const updateLessonFeatures = (lessonId: string, features: string[]) => {
    setContent((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, pageContent: { ...lesson.pageContent, features } }
          : lesson
      ),
    }));
  };

  const addLesson = () => {
    const newId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      id: newId,
      title: "שיעור חדש",
      date: "יום שני ה01.01",
      time: "19:00",
      examPeriod: "מועד חדש",
      section: "פרק ראשון",
      price: 70,
      zoomLink: "https://zoom.us/j/YOUR_LINK",
      upayLink: "",
      active: true,
      pageContent: {
        features: ["שיעור חי בזום", "תרגול אינטנסיבי", "מענה על שאלות בזמן אמת"],
      },
    };

    setContent((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));

    setEditingLesson(newId);
  };

  const deleteLesson = (lessonId: string) => {
    if (confirm("האם למחוק את השיעור?")) {
      setContent((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
      }));
    }
  };

  const handleImageUpload = async (lessonId: string, file: File) => {
    setIsUploadingImage(lessonId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        updateLesson(lessonId, "imageUrl", url);
        setMessage("התמונה הועלתה בהצלחה!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("שגיאה בהעלאת התמונה");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("שגיאה בהעלאת התמונה");
    } finally {
      setIsUploadingImage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">פאנל ניהול</h1>
          <div className="flex items-center gap-4">
            {message && (
              <span
                className={`text-sm ${
                  message.includes("שגיאה") ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </span>
            )}
            <button
              onClick={saveContent}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? "שומר..." : "שמור שינויים"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("homepage")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "homepage"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            עמוד הבית
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`pb-2 px-4 font-medium ${
              activeTab === "lessons"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            שיעורים
          </button>
        </div>

        {/* Homepage Tab */}
        {activeTab === "homepage" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">עריכת עמוד הבית</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כותרת ראשית
              </label>
              <input
                type="text"
                value={content.homepage.title}
                onChange={(e) => updateHomepage("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כותרת משנה
              </label>
              <input
                type="text"
                value={content.homepage.subtitle}
                onChange={(e) => updateHomepage("subtitle", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כותרת המקטע
              </label>
              <input
                type="text"
                value={content.homepage.sectionTitle}
                onChange={(e) => updateHomepage("sectionTitle", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שורות תיאור (3 שורות)
              </label>
              {content.homepage.description.map((line, index) => (
                <input
                  key={index}
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const newDesc = [...content.homepage.description];
                    newDesc[index] = e.target.value;
                    updateHomepage("description", newDesc);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  placeholder={`שורה ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">ניהול שיעורים</h2>
              <button
                onClick={addLesson}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + הוסף שיעור
              </button>
            </div>

            <div className="grid gap-4">
              {content.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          lesson.active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <h3 className="text-lg font-medium">{lesson.title}</h3>
                      <span className="text-gray-500 text-sm">
                        {lesson.date} בשעה {lesson.time}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditingLesson(
                            editingLesson === lesson.id ? null : lesson.id
                          )
                        }
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        {editingLesson === lesson.id ? "סגור" : "ערוך"}
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        מחק
                      </button>
                    </div>
                  </div>

                  {editingLesson === lesson.id && (
                    <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Upload Section */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תמונת השיעור (לוגו)
                        </label>
                        <div className="flex items-center gap-4">
                          {/* Current Image Preview */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                            {lesson.imageUrl ? (
                              <img
                                src={lesson.imageUrl}
                                alt={lesson.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Upload Button */}
                          <div className="flex-1">
                            <input
                              type="file"
                              id={`image-upload-${lesson.id}`}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(lesson.id, file);
                                }
                              }}
                            />
                            <label
                              htmlFor={`image-upload-${lesson.id}`}
                              className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                                isUploadingImage === lesson.id
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {isUploadingImage === lesson.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  מעלה...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  העלה תמונה
                                </>
                              )}
                            </label>
                            {lesson.imageUrl && (
                              <button
                                onClick={() => updateLesson(lesson.id, "imageUrl", "")}
                                className="mr-2 text-red-600 text-sm hover:underline"
                              >
                                הסר תמונה
                              </button>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              התמונה תוצג בכרטיס השיעור בעמוד הקטלוג
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          שם השיעור
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(lesson.id, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          תאריך
                        </label>
                        <input
                          type="text"
                          value={lesson.date}
                          onChange={(e) =>
                            updateLesson(lesson.id, "date", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          שעה
                        </label>
                        <input
                          type="text"
                          value={lesson.time}
                          onChange={(e) =>
                            updateLesson(lesson.id, "time", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          מחיר (ש&quot;ח)
                        </label>
                        <input
                          type="number"
                          value={lesson.price}
                          onChange={(e) =>
                            updateLesson(lesson.id, "price", Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          מועד בחינה
                        </label>
                        <input
                          type="text"
                          value={lesson.examPeriod}
                          onChange={(e) =>
                            updateLesson(lesson.id, "examPeriod", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          פרק
                        </label>
                        <input
                          type="text"
                          value={lesson.section}
                          onChange={(e) =>
                            updateLesson(lesson.id, "section", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          קישור Upay לתשלום
                        </label>
                        <input
                          type="url"
                          value={lesson.upayLink || ""}
                          onChange={(e) =>
                            updateLesson(lesson.id, "upayLink", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          dir="ltr"
                          placeholder="https://app.upay.co.il/API6/s.php?m=..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          קישור זום (נשלח במייל אחרי תשלום)
                        </label>
                        <input
                          type="url"
                          value={lesson.zoomLink}
                          onChange={(e) =>
                            updateLesson(lesson.id, "zoomLink", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          dir="ltr"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          תכונות השיעור (בעמוד המכירה)
                        </label>
                        {(lesson.pageContent?.features || []).map((feature, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [
                                  ...(lesson.pageContent?.features || []),
                                ];
                                newFeatures[index] = e.target.value;
                                updateLessonFeatures(lesson.id, newFeatures);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => {
                                const newFeatures = (
                                  lesson.pageContent?.features || []
                                ).filter((_, i) => i !== index);
                                updateLessonFeatures(lesson.id, newFeatures);
                              }}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newFeatures = [
                              ...(lesson.pageContent?.features || []),
                              "תכונה חדשה",
                            ];
                            updateLessonFeatures(lesson.id, newFeatures);
                          }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          + הוסף תכונה
                        </button>
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`active-${lesson.id}`}
                          checked={lesson.active}
                          onChange={(e) =>
                            updateLesson(lesson.id, "active", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`active-${lesson.id}`}
                          className="text-sm text-gray-700"
                        >
                          שיעור פעיל (מוצג באתר)
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
