import { getDb } from "@/lib/mongodb";
import { SiteContent, defaultContent } from "@/types/content";

const COLLECTION = "content";
const DOC_ID = "site-content";

// In-memory cache to avoid hitting MongoDB on every request
let cachedContent: SiteContent | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function getContent(): Promise<SiteContent> {
  try {
    // Return cached content if fresh
    if (cachedContent && Date.now() - cacheTime < CACHE_TTL) {
      return cachedContent;
    }

    if (!process.env.MONGODB_URI) {
      console.log("No MONGODB_URI, using default content");
      return defaultContent;
    }

    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: DOC_ID as never });

    let content: SiteContent;
    if (doc) {
      // Remove MongoDB _id field
      const { _id, ...saved } = doc as unknown as SiteContent & { _id: string };
      // Merge with defaults so new fields are available
      content = {
        ...defaultContent,
        ...saved,
        homepage: {
          ...defaultContent.homepage,
          ...saved.homepage,
        },
      };
    } else {
      content = defaultContent;
    }

    // Update cache
    cachedContent = content;
    cacheTime = Date.now();

    return content;
  } catch (error) {
    console.error("Error fetching content:", error);
    return cachedContent || defaultContent;
  }
}

export async function saveContent(content: SiteContent): Promise<string> {
  try {
    const db = await getDb();
    await db.collection(COLLECTION).replaceOne(
      { _id: DOC_ID as never },
      { ...content, _id: DOC_ID } as never,
      { upsert: true }
    );

    // Invalidate cache so next read picks up changes
    cachedContent = content;
    cacheTime = Date.now();

    return "saved";
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}
