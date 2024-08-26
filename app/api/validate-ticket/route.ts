import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Order from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model";

/**
 * Validates a ticket based on the provided request.
 *
 * @param req - The request object containing the orderId, eventId, organizerId.
 * @returns A JSON response indicating whether the ticket is valid or not and the ticket information.
 * @throws If there is an error validating the ticket, an error response is returned.
 */
export async function POST(req: Request) {
  try {
    const { orderId, eventId, organizerId } = await req.json();

    await connectToDatabase();

    const order = await Order.findById(orderId)
      .populate({
        path: "event",
        model: Event,
      })
      .populate({
        path: "buyer",
        model: User,
      });

    if (
      !order ||
      order.event._id.toString() !== eventId.toString() ||
      order.event.organizer._id.toString() !== organizerId.toString()
    ) {
      return NextResponse.json({ isValid: false }, { status: 400 });
    }

    return NextResponse.json({
      isValid: true,
      ticketInfo: {
        eventId: order.event._id.toString(),
        eventName: order.event.title,
        eventDate: order.event.startDateTime,
        eventEndDateTime: order.event.endDateTime,
        attendeeName: `${order.buyer.firstName} ${order.buyer.lastName}`,
        orderId: order._id.toString(),
        used: order.used,
      },
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
