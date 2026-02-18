import { put, list } from "@vercel/blob";
import { Booking } from "@/types/content";

const BOOKINGS_BLOB_NAME = "bookings.json";

export async function getBookings(): Promise<Booking[]> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("No BLOB_READ_WRITE_TOKEN, returning empty bookings");
      return [];
    }

    const { blobs } = await list({ prefix: BOOKINGS_BLOB_NAME });

    if (blobs.length > 0) {
      const bookingsBlob = blobs[0];
      const response = await fetch(bookingsBlob.url, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function addBooking(booking: Booking): Promise<void> {
  try {
    const bookings = await getBookings();
    bookings.push(booking);

    await put(BOOKINGS_BLOB_NAME, JSON.stringify(bookings, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}
