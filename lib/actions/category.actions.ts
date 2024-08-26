"use server";

import { CreateCategoryParams } from "@/app/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Category from "../database/models/category.model";

/**
 * Creates a new category.
 *
 * @param {CreateCategoryParams} params - The parameters for creating a category.
 * @param {string} params.categoryName - The name of the category.
 * @returns {Promise<object>} - A promise that resolves to the newly created category.
 */
export const createCategory = async ({
  categoryName,
}: CreateCategoryParams) => {
  try {
    await connectToDatabase();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
};

/**
 * Retrieves all categories from the database.
 *
 * Retrieves all categories from the database.
 * @returns {Promise<any>} A promise that resolves to an array of categories.
 */
export const getAllCategories = async () => {
  try {
    await connectToDatabase();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};

/**
 * Retrieves a category by its name.
 *
 * @param name - The name of the category to retrieve.
 * @returns A promise that resolves to the category matching the given name.
 */
export const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};
