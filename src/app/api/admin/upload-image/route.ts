import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { Binary } from "mongodb";

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const lessonId = formData.get("lessonId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageId = `${lessonId}-${Date.now()}`;

    const db = await getDb();
    await db.collection("images").updateOne(
      { _id: imageId as never },
      {
        $set: {
          _id: imageId,
          data: new Binary(buffer),
          contentType: file.type,
          filename: file.name,
          uploadedAt: new Date(),
        } as never,
      },
      { upsert: true }
    );

    const url = `/api/images/${imageId}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
