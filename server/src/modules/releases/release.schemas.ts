import { z } from "zod";
import { releaseCategories } from "./release.types.js";

const categorySchema = z.enum(releaseCategories);

export const createReleaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or less"),
  category: categorySchema,
});

export const updateReleaseSchema = createReleaseSchema.partial().extend({
  completed: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required");
