import { env } from "../../config/env.js";
import type { ActivityRepository } from "../activities/activity.repository.js";
import type { ActivityType } from "../activities/activity.types.js";
import type { ImportResult, StravaActivity, StravaTokenResponse } from "./strava.types.js";

const STRAVA_API = "https://www.strava.com/api/v3";
const TOKEN_URL = "https://www.strava.com/oauth/token";

const STRAVA_TYPE_MAP: Record<string, ActivityType> = {
  Run: "Run",
  TrailRun: "Run",
  VirtualRun: "Run",
  Walk: "Walk",
  Hike: "Walk",
  Ride: "Ride",
  VirtualRide: "Ride",
  GravelRide: "Ride",
  EBikeRide: "Ride",
  MountainBikeRide: "Ride",
  WeightTraining: "Workout",
  Workout: "Workout",
  Crossfit: "Workout",
  Swim: "Workout",
  Yoga: "Meditation",
  Meditation: "Meditation",
  Sleep: "Sleep",
};

function mapStravaType(stravaType: string): ActivityType {
  return STRAVA_TYPE_MAP[stravaType] ?? "Workout";
}

export function buildStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID!,
    redirect_uri: env.STRAVA_REDIRECT_URI,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  return res.json() as Promise<StravaTokenResponse>;
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  return res.json() as Promise<StravaTokenResponse>;
}

export async function fetchStravaActivities(
  accessToken: string,
  page = 1,
  perPage = 100,
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const res = await fetch(`${STRAVA_API}/athlete/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava activities fetch failed: ${res.status}`);
  return res.json() as Promise<StravaActivity[]>;
}

export async function importStravaActivities(
  accessToken: string,
  repository: ActivityRepository,
  maxPages = 3,
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: 0 };

  for (let page = 1; page <= maxPages; page++) {
    const activities = await fetchStravaActivities(accessToken, page);
    if (activities.length === 0) break;

    for (const sa of activities) {
      const externalId = `strava:${sa.id}`;
      try {
        // Check if already imported by querying for externalId.
        // In-memory repo doesn't support this, so we catch unique constraint errors.
        const date = sa.start_date_local.slice(0, 10);
        const durationMinutes = Math.round(sa.moving_time / 60);
        const distanceKm = sa.distance > 0 ? parseFloat((sa.distance / 1000).toFixed(2)) : null;
        const type = mapStravaType(sa.type ?? sa.sport_type);

        await (repository as ActivityRepository & {
          create: (input: {
            type: ActivityType;
            title: string;
            date: string;
            durationMinutes: number;
            distanceKm: number | null;
            notes: string | null;
            source?: string;
            externalId?: string;
          }) => Promise<unknown>;
        }).create({
          type,
          title: sa.name,
          date,
          durationMinutes: Math.max(1, durationMinutes),
          distanceKm,
          notes: null,
          source: "strava",
          externalId,
        });
        result.imported++;
      } catch {
        result.skipped++;
      }
    }

    if (activities.length < 100) break;
  }

  return result;
}
