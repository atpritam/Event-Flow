import { z } from "zod";

export const EventFormSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, {
      message: "Title must not exceed 100 characters.",
    }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must not exceed 500 characters.",
    }),
  location: z
    .string()
    .min(3, {
      message: "Location must be at least 3 characters.",
    })
    .max(100, {
      message: "Location must not exceed 100 characters.",
    }),
  imageUrl: z.string().url({
    message: "Image URL must be a valid URL.",
  }),
  startDateTime: z.date().min(new Date(), {
    message: "Start date must be in the future.",
  }),
  endDateTime: z.date().min(new Date(), {
    message: "End date must be in the future.",
  }),
  categoryId: z.string().min(1, {
    message: "Category must be selected.",
  }),
  price: z.string().max(10, {
    message: "Price must not exceed 10 characters.",
  }),
  isFree: z.boolean().default(false),
  url: z.string().url({
    message: "URL must be a valid URL.",
  }),
});
