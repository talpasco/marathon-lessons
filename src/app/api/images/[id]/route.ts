import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Binary } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const doc = await db.collection("images").findOne({ _id: id as never });

    if (!doc) {
      return new NextResponse("Not found", { status: 404 });
    }

    const binary = doc.data as Binary;
    const buffer = Buffer.from(binary.buffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": (doc.contentType as string) || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
