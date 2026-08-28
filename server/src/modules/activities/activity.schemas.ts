import { z } from "zod";
import { activityTypes, distanceActivityTypes } from "./activity.types.js";

const typeSchema = z.enum(activityTypes);

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Date is not a valid calendar date");

const baseActivitySchema = z.object({
  type: typeSchema,
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  date: isoDateSchema,
  durationMinutes: z
    .number()
    .int("Duration must be a whole number of minutes")
    .positive("Duration must be greater than zero")
    .max(24 * 60, "Duration cannot exceed 24 hours"),
  distanceKm: z
    .number()
    .positive("Distance must be greater than zero")
    .max(1000, "Distance looks too large")
    .nullish(),
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or less").nullish(),
});

/** A distance may only be attached to Run/Walk/Ride activities. */
const distanceMatchesType = (value: { type: z.infer<typeof typeSchema>; distanceKm?: number | null }) =>
  value.distanceKm == null || distanceActivityTypes.includes(value.type);

export const createActivitySchema = baseActivitySchema.refine(distanceMatchesType, {
  message: "Distance can only be set for Run, Walk or Ride activities",
  path: ["distanceKm"],
});

export const updateActivitySchema = baseActivitySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const listActivityQuerySchema = z.object({
  type: typeSchema.optional(),
});
