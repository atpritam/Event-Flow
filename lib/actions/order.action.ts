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
import Order, { IOrder, IOrderItem } from "../database/models/order.model";
import Event from "../database/models/event.model";
import { ObjectId } from "mongodb";
import User from "../database/models/user.model";
import { isValidObjectId } from "mongoose";
import { auth } from "@clerk/nextjs/server";

/**
 * Handles the checkout process for an order using Stripe.
 *
 * @param order - The order to be checked out.
 * @returns Promise<void>
 * @throws Error - If an error occurs during the checkout process.
 */
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

/**
 * Creates a new order and saves it to the database.
 *
 * @param order - The order parameters.
 * @returns The newly created order.
 */
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

/**
 * Retrieves orders related to a specific event for an authorized user(Organizer)
 *
 * @param {GetOrdersByEventParams} params - The parameters for retrieving orders.
 * @param {string} params.searchString - The search string for filtering orders by buyer name.
 * @param {string} params.eventId - The ID of the event.
 * @param {string} params.userId - The ID of the user.
 * @returns {Promise<IOrderItem[]>} - A promise that resolves to the retrieved orders.
 * @throws {Error} - If the input is invalid, unauthorized, or the event is not found.
 */
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

/**
 * Retrieves all orders for every event created by the user(Organizer) based on search criteria.
 *
 * @param {GetAllOrdersParams} params - The parameters for retrieving orders.
 * @param {string} params.searchString - The search string to filter orders by buyer name.
 * @param {string} params.userId - The ID of the user to retrieve orders for.
 * @returns {Promise<IOrderItem[]>} - A promise that resolves to an array of orders.
 * @throws {Error} - If the user ID is invalid or unauthorized.
 */
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

/**
 * Retrieves orders placed by a specific user.
 *
 * @param {GetOrdersByUserParams} params - The parameters for retrieving orders.
 * @param {string} params.userId - The ID of the user.
 * @param {number} [params.limit=3] - The maximum number of orders to retrieve per page.
 * @param {number} params.page - The page number.
 * @returns {Promise<{ data: IOrderItem[]; totalPages: number }>} The retrieved orders and the total number of pages.
 */
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

/**
 * Retrieves a specific order by ID for an authorized user(Organizer of the event)
 *
 * @param orderId - The ID of the order to retrieve.
 * @param userId - The ID of the user making the request.
 * @returns The order object as a JSON string.
 * @throws Error if the provided user ID or order ID is invalid.
 * @throws Error if the user is unauthorized to access the order.
 * @throws Error if the order is not found.
 */
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

/**
 * Marks an order/booking as used by the buyer
 * This is done by the organizer of the event
 *
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<IOrderItem>} - A promise that resolves to the updated order object.
 * @throws {Error} - If the provided user ID or order ID is invalid.
 * @throws {Error} - If the user is unauthorized to mark the order as used.
 * @throws {Error} - If the order or event associated with the order is not found.
 * @throws {Error} - If the order is not found after the update.
 */
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
