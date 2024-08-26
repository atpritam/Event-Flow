"use server";

import {
  CreateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
  UpdateEventParams,
} from "@/app/types";
import { handleError } from "../utils";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import Event, { IEvent } from "../database/models/event.model";
import User from "../database/models/user.model";
import { isValidObjectId } from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { getCategoryByName } from "./category.actions";

/**
 * Creates a new event.
 *
 * @param {CreateEventParams} params - The parameters for creating the event.
 * @param {Event} params.event - The event object.
 * @param {string} params.userId - The ID of the user creating the event.
 * @returns {Promise<object>} - A promise that resolves to the created event.
 * @throws {Error} - If the organizer is not found or an error occurs during the creation process.
 */
export const createEvent = async ({ event, userId }: CreateEventParams) => {
  try {
    await connectToDatabase();

    const organizer = User.findById(userId);

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: userId,
    });

    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
};

/**
 * Retrieves an event by its ID.
 *
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the retrieved event.
 * @throws {Error} - If the event is not found.
 */
export const getEventById = async (eventId: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId)
      .populate("category")
      .populate("organizer");

    if (!event) {
      throw new Error("Event not found");
    }

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
};

/**
 * Retrieves all events, with pagination.
 *
 * @param {GetAllEventsParams} params - The parameters for retrieving events.
 * @returns {Promise<{ data: IEvent[], totalPages: number }>} - The retrieved events and the total number of pages.
 */
export async function getAllEvents({
  query,
  limit = 6,
  page,
  category,
}: GetAllEventsParams) {
  try {
    await connectToDatabase();

    const titleCondition = query
      ? { title: { $regex: query, $options: "i" } }
      : {};
    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;
    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };

    const skipAmount = (Number(page) - 1) * limit;
    const events = await Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate("category")
      .populate("organizer");

    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes an event.
 *
 * @param {DeleteEventParams} params - The parameters for deleting an event.
 * @param {string} params.eventId - The ID of the event to delete.
 * @param {string} params.path - The path of the event.
 * @param {string} params.userId - The ID of the user deleting the event.
 * @returns {Promise<void>} - A promise that resolves when the event is deleted.
 * @throws {Error} - If the input is invalid, unauthorized, or the event is not found.
 */
export async function deleteEvent({
  eventId,
  path,
  userId,
}: DeleteEventParams) {
  try {
    if (
      !isValidObjectId(userId) ||
      !isValidObjectId(eventId) ||
      typeof path !== "string"
    ) {
      throw new Error("Invalid input parameters.");
    }

    const { sessionClaims } = auth();
    const sessionUser = sessionClaims?.userId as string;

    // Check if the user is authorized
    if (userId !== sessionUser) {
      throw new Error("User is not authorized to delete this event.");
    }

    await connectToDatabase();

    const event = await Event.findById(eventId).populate("organizer");

    // Check if the event exists and if the user is the organizer
    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.organizer._id.toHexString() !== userId) {
      throw new Error("User is not authorized to delete this event.");
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (deletedEvent) {
      revalidatePath(path);
      return { success: true, message: "Event deleted successfully." };
    } else {
      throw new Error("Failed to delete the event.");
    }
  } catch (error) {
    handleError(error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Updates an event.
 *
 * @param {UpdateEventParams} params - The parameters for updating the event.
 * @returns {Promise<IEvent>} - A promise that resolves to the updated event.
 * @throws {Error} - If the input is invalid, the user is unauthorized, or the event is not found.
 */
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    if (
      !isValidObjectId(userId) ||
      !isValidObjectId(event._id) ||
      !isValidObjectId(event.categoryId) ||
      typeof path !== "string"
    ) {
      throw new Error("Invalid input");
    }

    const { sessionClaims } = auth();
    const sessionUser = sessionClaims?.userId as string;
    if (userId !== sessionUser) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const eventToUpdate = await Event.findById(event._id);
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error("Unauthorized or event not found");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Retrieves related events by category.
 *
 * @param {GetRelatedEventsByCategoryParams} params - The parameters for retrieving related events.
 * @returns {Promise<{ data: IEvent[]; totalPages: number }>} - The retrieved events and total number of pages.
 */
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const events = await Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate("category")
      .populate("organizer");

    const totalEvents = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(totalEvents / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Retrieves events created by user.
 *
 * @param {GetEventsByUserParams} params - The parameters for retrieving events.
 * @param {string} params.userId - The ID of the user.
 * @param {number} [params.limit=6] - The maximum number of events to retrieve per page.
 * @param {number} params.page - The page number.
 * @returns {Promise<{ data: IEvent[]; totalPages: number }>} - The retrieved events and total number of pages.
 */
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    const conditions = { organizer: userId };
    const skipAmount = (page - 1) * limit;

    const events = await Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate("category")
      .populate("organizer");

    const totalEvents = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(totalEvents / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Checks if tickets are still available, based on the event's end date.
 *
 * @param eventId - The ID of the event to check.
 * @returns An object containing the availability of tickets.
 * @throws If the event is not found or an error occurs.
 */
export async function checkValidity(eventId: string) {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const now = new Date();
    const endDate = new Date(event.endDateTime);
    const ticketsAvailable = now <= endDate;

    return { ticketsAvailable };
  } catch (error) {
    handleError(error);
  }
}
