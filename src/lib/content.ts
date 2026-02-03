import { put, head } from "@vercel/blob";
import { SiteContent, defaultContent } from "@/types/content";

const CONTENT_BLOB_NAME = "site-content.json";

export async function getContent(): Promise<SiteContent> {
  try {
    // Try to get content from Vercel Blob
    const blobUrl = process.env.BLOB_CONTENT_URL;

    if (blobUrl) {
      const response = await fetch(blobUrl, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
    }

    // Return default content if blob doesn't exist
    return defaultContent;
  } catch (error) {
    console.error("Error fetching content:", error);
    return defaultContent;
  }
}

export async function saveContent(content: SiteContent): Promise<string> {
  const blob = await put(CONTENT_BLOB_NAME, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}
