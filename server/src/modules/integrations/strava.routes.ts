import { Router, type Request, type Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { InMemoryActivityRepository } from "../activities/activity.repository.js";
import {
  buildStravaAuthUrl,
  exchangeStravaCode,
  importStravaActivities,
} from "./strava.service.js";

const router: Router = Router();

// Lazy-load Prisma so the server works without a DB.
async function getRepository() {
  if (process.env["DATABASE_URL"]) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — generated at runtime via `prisma generate`
      const { PrismaClient } = await import("../../generated/prisma/index.js");
      const { PrismaActivityRepository } = await import(
        "../activities/prisma-activity.repository.js"
      );
      return new PrismaActivityRepository(new PrismaClient());
    } catch {
      // fall through
    }
  }
  return new InMemoryActivityRepository();
}

/**
 * GET /api/v1/integrations/strava/connect
 * Redirects the browser to Strava's OAuth consent screen.
 */
router.get("/connect", (req: Request, res: Response) => {
  if (!env.STRAVA_CLIENT_ID || !env.STRAVA_CLIENT_SECRET) {
    throw new AppError(
      "Strava integration is not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in server/.env",
      503,
    );
  }
  res.redirect(buildStravaAuthUrl());
});

/**
 * GET /api/v1/integrations/strava/callback
 * Strava redirects here after the user grants access.
 * Exchanges the code, imports activities, then redirects back to the frontend.
 */
router.get("/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query as Record<string, string>;

  if (error || !code) {
    return res.redirect(`${env.APP_URL}?strava=denied`);
  }

  try {
    const tokens = await exchangeStravaCode(code);
    const repository = await getRepository();
    const result = await importStravaActivities(tokens.access_token, repository);

    return res.redirect(
      `${env.APP_URL}?strava=synced&imported=${result.imported}&skipped=${result.skipped}`,
    );
  } catch (err) {
    console.error("Strava callback error:", err);
    return res.redirect(`${env.APP_URL}?strava=error`);
  }
});

/**
 * GET /api/v1/integrations/strava/status
 * Returns whether Strava integration is configured on this server.
 */
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      configured: Boolean(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET),
      connectUrl: "/api/v1/integrations/strava/connect",
    },
  });
});

export default router;
