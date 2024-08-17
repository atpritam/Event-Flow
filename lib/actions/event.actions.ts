"use server";

import {
  CreateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
} from "@/app/types";
import { handleError } from "../utils";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import User from "../database/models/user.model";

export const createEvent = async ({
  event,
  userId,
  path,
}: CreateEventParams) => {
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

export const getAllEvents = async ({
  query,
  limit = 6,
  page,
  category,
}: GetAllEventsParams) => {
  const conditions = {};
  const eventsQuery = Event.find(conditions)
    .sort({ createdAt: "desc" })
    .skip(0)
    .limit(limit)
    .populate("category")
    .populate("organizer");

  const eventsCount = Event.countDocuments(conditions);

  const [events, totalEvents] = await Promise.all([eventsQuery, eventsCount]);

  return {
    data: JSON.parse(JSON.stringify(events)),
    totalPages: Math.ceil(totalEvents / limit),
  };
};

export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}
