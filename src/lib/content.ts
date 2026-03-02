import { getDb } from "@/lib/mongodb";
import { SiteContent, defaultContent } from "@/types/content";

const COLLECTION = "content";
const DOC_ID = "site-content";

export async function getContent(): Promise<SiteContent> {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("No MONGODB_URI, using default content");
      return defaultContent;
    }

    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: DOC_ID as never });

    if (doc) {
      // Remove MongoDB _id field
      const { _id, ...saved } = doc as unknown as SiteContent & { _id: string };
      // Merge with defaults so new fields are available
      return {
        ...defaultContent,
        ...saved,
        homepage: {
          ...defaultContent.homepage,
          ...saved.homepage,
        },
      };
    }

    return defaultContent;
  } catch (error) {
    console.error("Error fetching content:", error);
    return defaultContent;
  }
}

export async function saveContent(content: SiteContent): Promise<string> {
  try {
    const db = await getDb();
    await db.collection(COLLECTION).updateOne(
      { _id: DOC_ID as never },
      { $set: { ...content, _id: DOC_ID } as never },
      { upsert: true }
    );

    return "saved";
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}
