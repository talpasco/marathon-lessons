import { put, list } from "@vercel/blob";
import { SiteContent, defaultContent } from "@/types/content";

const CONTENT_BLOB_NAME = "site-content.json";

export async function getContent(): Promise<SiteContent> {
  try {
    // Check if BLOB token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("No BLOB_READ_WRITE_TOKEN, using default content");
      return defaultContent;
    }

    // List blobs to find our content file
    const { blobs } = await list({ prefix: CONTENT_BLOB_NAME });

    if (blobs.length > 0) {
      // Get the most recent blob
      const contentBlob = blobs[0];
      const response = await fetch(contentBlob.url, { cache: "no-store" });
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
  try {
    const blob = await put(CONTENT_BLOB_NAME, JSON.stringify(content, null, 2), {
      access: "public",
      addRandomSuffix: false,
    });

    return blob.url;
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}
