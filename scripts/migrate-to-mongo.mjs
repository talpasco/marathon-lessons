/**
 * Migration script: Vercel Blob -> MongoDB
 *
 * Reads site-content.json and bookings.json from Vercel Blob,
 * then inserts them into MongoDB collections.
 *
 * Usage: node scripts/migrate-to-mongo.mjs
 * Requires: BLOB_READ_WRITE_TOKEN and MONGODB_URI in .env.local
 */

import { list } from "@vercel/blob";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let value = trimmed.slice(eqIdx + 1);
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

if (!BLOB_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

async function fetchBlob(prefix) {
  const { blobs } = await list({ prefix, token: BLOB_TOKEN });
  if (blobs.length === 0) return null;
  const response = await fetch(blobs[0].url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function main() {
  console.log("=== Vercel Blob -> MongoDB Migration ===\n");

  // 1. Fetch data from Vercel Blob
  console.log("Fetching site-content.json from Vercel Blob...");
  const content = await fetchBlob("site-content.json");
  if (content) {
    console.log(`  Found content with ${content.lessons?.length || 0} lessons`);
  } else {
    console.log("  No content found in blob (will use defaults)");
  }

  console.log("Fetching bookings.json from Vercel Blob...");
  const bookings = await fetchBlob("bookings.json");
  if (bookings) {
    console.log(`  Found ${bookings.length} bookings`);
  } else {
    console.log("  No bookings found in blob");
  }

  // 2. Connect to MongoDB
  console.log("\nConnecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("marathon-lessons");
  console.log("  Connected!");

  // 3. Insert content
  if (content) {
    console.log("\nMigrating site content...");
    const contentCol = db.collection("content");
    // Use upsert so the script is idempotent
    await contentCol.updateOne(
      { _id: "site-content" },
      { $set: { ...content, _id: "site-content" } },
      { upsert: true }
    );
    console.log("  Site content saved to 'content' collection");
  }

  // 4. Insert bookings
  if (bookings && bookings.length > 0) {
    console.log("\nMigrating bookings...");
    const bookingsCol = db.collection("bookings");

    let inserted = 0;
    let skipped = 0;
    for (const booking of bookings) {
      // Use transactionId as unique key for idempotency
      const result = await bookingsCol.updateOne(
        { transactionId: booking.transactionId },
        { $setOnInsert: booking },
        { upsert: true }
      );
      if (result.upsertedCount > 0) inserted++;
      else skipped++;
    }
    console.log(`  Inserted ${inserted} bookings, skipped ${skipped} duplicates`);
  }

  // 5. Create indexes
  console.log("\nCreating indexes...");
  const bookingsCol = db.collection("bookings");
  await bookingsCol.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
  await bookingsCol.createIndex({ lessonId: 1 });
  console.log("  Indexes created on bookings collection");

  await client.close();
  console.log("\n=== Migration complete! ===");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
