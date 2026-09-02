import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JSON_BODY_LIMIT: z.string().default("1mb"),
  DATABASE_URL: z.string().optional(),
  // Strava OAuth - optional; integration is disabled if these are absent
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  STRAVA_REDIRECT_URI: z.string().default("http://localhost:5000/api/v1/integrations/strava/callback"),
  // Frontend URL used for post-OAuth redirect
  APP_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
