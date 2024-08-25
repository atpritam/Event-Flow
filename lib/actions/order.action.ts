"use server";

import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from "@/app/types";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Order from "../database/models/order.model";
import Event from "../database/models/event.model";
import { ObjectId } from "mongodb";
import User from "../database/models/user.model";
import { isValidObjectId } from "mongoose";
import { auth } from "@clerk/nextjs/server";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const price = order.isFree ? 0 : Number(order.price) * 100;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: order.eventTitle,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        buyerId: order.buyerId,
        eventId: order.eventId,
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    });
    redirect(session.url!);
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

export async function getOrdersByEvent({
  searchString,
  eventId,
  userId,
}: GetOrdersByEventParams) {
  try {
    if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
      throw new Error("Invalid Input");
    }

    const { sessionClaims } = auth();
    const user = sessionClaims?.userId as string;

    if (userId !== user) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const event = await Event.findById(eventId).populate("organizer");
    if (!event || event.organizer._id.toHexString() !== userId) {
      throw new Error("Unauthorized or event not found");
    }

    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyer: {
            $concat: ["$buyer.firstName", " ", "$buyer.lastName"],
          },
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString, "i") } },
          ],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

interface GetAllOrdersParams {
  searchString: string;
  userId: string;
}

export async function getAllOrdersByUser({
  searchString,
  userId,
}: GetAllOrdersParams) {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid Input");
    }

    const { sessionClaims } = auth();
    const user = sessionClaims?.userId as string;

    if (userId !== user) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const userEvents = await Event.find({ organizer: userId }).select("_id");

    const eventIds = userEvents.map((event) => event._id);

    if (eventIds.length === 0) {
      return [];
    }

    const orders = await Order.aggregate([
      {
        $match: {
          event: { $in: eventIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyer: {
            $concat: ["$buyer.firstName", " ", "$buyer.lastName"],
          },
        },
      },
      {
        $match: {
          buyer: { $regex: RegExp(searchString, "i") },
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.distinct("event._id")
      .find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });

    const ordersCount = await Order.distinct("event._id").countDocuments(
      conditions
    );

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

export async function getOrderByID(orderId: string, userId: string) {
  try {
    if (!isValidObjectId(userId) || !isValidObjectId(orderId)) {
      throw new Error("Invalid ID");
    }
    const { sessionClaims } = auth();
    const user = sessionClaims?.userId as string;
    if (userId !== user) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const order = await Order.findById(orderId)
      .populate({ path: "event", model: Event })
      .populate({ path: "buyer", model: User });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order?.event.organizer.toHexString() !== userId) {
      throw new Error("Unauthorized: User is not the organizer of the event");
    }

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
}

export const markOrderAsUsed = async (orderId: string, userId: string) => {
  try {
    if (!isValidObjectId(userId) || !isValidObjectId(orderId)) {
      throw new Error("Invalid ID");
    }

    const { sessionClaims } = auth();
    const user = sessionClaims?.userId as string;
    if (userId !== user) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const order = await Order.findById(orderId).populate("event");
    if (!order) throw new Error("Order not found");

    const event = await Event.findById(order.event._id);
    if (!event) throw new Error("Event not found");

    // Authorization
    if (event.organizer.toHexString() !== userId) {
      throw new Error("Unauthorized: User is not the organizer of the event");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { used: true },
      { new: true }
    );

    if (!updatedOrder) throw new Error("Order not found after update");

    return JSON.parse(JSON.stringify(updatedOrder));
  } catch (error) {
    handleError(error);
  }
};
