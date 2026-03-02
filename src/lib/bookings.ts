import { getDb } from "@/lib/mongodb";
import { Booking } from "@/types/content";

const COLLECTION = "bookings";

export async function getBookings(): Promise<Booking[]> {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("No MONGODB_URI, returning empty bookings");
      return [];
    }

    const db = await getDb();
    const docs = await db.collection(COLLECTION).find().toArray();
    // Strip MongoDB _id from results
    return docs.map(({ _id, ...rest }) => rest) as unknown as Booking[];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function addBooking(booking: Booking): Promise<void> {
  try {
    const db = await getDb();
    await db.collection(COLLECTION).insertOne(booking as never);
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}

// Check if a booking with this transactionId already exists
export async function bookingExists(transactionId: string): Promise<boolean> {
  if (!transactionId) return false;
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ transactionId });
  return doc !== null;
}
