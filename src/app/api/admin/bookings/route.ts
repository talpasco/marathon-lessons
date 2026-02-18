import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getBookings } from "@/lib/bookings";

export async function GET() {
  const isValid = await verifySession();
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
