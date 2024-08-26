"use server";

import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Order from "@/lib/database/models/order.model";
import Event from "@/lib/database/models/event.model";
import { revalidatePath } from "next/cache";
import { CreateUserParams, UpdateUserParams } from "@/app/types";
import mongoose, { isValidObjectId } from "mongoose";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates a new user.
 *
 * @param user - The user object containing the necessary information.
 * @returns A promise that resolves to the newly created user.
 * @throws If an error occurs during the creation process.
 */
export const createUser = async (user: CreateUserParams) => {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
};

/**
 * Retrieves a user by their ID.
 *
 * @param userId - The ID of the user to retrieve.
 * @returns A Promise that resolves to the user object.
 * @throws {Error} If the provided ID is invalid or if the user is unauthorized.
 */
export async function getUserById(userId: string) {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error("Invalid ID");
    }

    const { sessionClaims } = auth();
    const sessionUser = sessionClaims?.userId as string;
    if (userId !== sessionUser) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates a user in the database.
 *
 * @param clerkId - The ID of the user to update.
 * @param user - The updated user data.
 * @returns The updated user object.
 * @throws Error if the clerkId is invalid or if the user is unauthorized.
 */
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    if (!isValidObjectId(clerkId)) {
      throw new Error("Invalid ID");
    }

    const { sessionClaims } = auth();
    const sessionUser = sessionClaims?.userId as string;
    if (clerkId !== sessionUser) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes a user.
 *
 * @param clerkId - The clerkID of the user to delete.
 * @returns The deleted user object, or null if the user was not found.
 * @throws Error if the ID is invalid, the user is unauthorized, or an error occurs during the deletion process.
 */
export async function deleteUser(clerkId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!isValidObjectId(clerkId)) {
      throw new Error("Invalid ID");
    }

    const { sessionClaims } = auth();
    const sessionUser = sessionClaims?.userId as string;
    if (clerkId !== sessionUser) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId }).session(session);

    if (!userToDelete) {
      throw new Error("User not found");
    }

    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } },
        { session }
      ),

      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } },
        { session }
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id).session(
      session
    );

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(error);
  }
}
