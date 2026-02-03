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
    console.log("POST /api/admin/content - authenticated:", isAuthenticated);

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content: SiteContent = await request.json();
    console.log("Content received, lessons count:", content.lessons?.length);

    // Validate content structure
    if (!content.homepage || !content.lessons) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    const blobUrl = await saveContent(content);
    console.log("Content saved to:", blobUrl);

    return NextResponse.json({ success: true, blobUrl });
  } catch (error) {
    console.error("Error saving content:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to save content: ${errorMessage}` }, { status: 500 });
  }
}
