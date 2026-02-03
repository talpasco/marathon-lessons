import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content";
import { SiteContent } from "@/types/content";

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error getting content:", error);
    return NextResponse.json({ error: "Failed to get content" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content: SiteContent = await request.json();

    // Validate content structure
    if (!content.homepage || !content.lessons) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    const blobUrl = await saveContent(content);

    return NextResponse.json({ success: true, blobUrl });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
