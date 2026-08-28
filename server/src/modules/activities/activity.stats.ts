import type { Activity, ActivityStats, ActivityType } from "./activity.types.js";
import { activityTypes } from "./activity.types.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` for a Date, in UTC, matching how activity dates are stored. */
function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Derives the dashboard summary from a list of activities. Pure and
 * side-effect free so it can be unit tested without a repository.
 */
export function buildActivityStats(activities: Activity[], now: Date = new Date()): ActivityStats {
  const today = toIsoDay(now);
  const weekAgo = toIsoDay(new Date(now.getTime() - 6 * MS_PER_DAY));

  const thisWeek = { activities: 0, durationMinutes: 0, distanceKm: 0 };
  const byType = new Map<ActivityType, { count: number; durationMinutes: number; distanceKm: number }>();
  const activeDays = new Set<string>();

  for (const activity of activities) {
    activeDays.add(activity.date);

    const bucket = byType.get(activity.type) ?? { count: 0, durationMinutes: 0, distanceKm: 0 };
    bucket.count += 1;
    bucket.durationMinutes += activity.durationMinutes;
    bucket.distanceKm += activity.distanceKm ?? 0;
    byType.set(activity.type, bucket);

    if (activity.date >= weekAgo && activity.date <= today) {
      thisWeek.activities += 1;
      thisWeek.durationMinutes += activity.durationMinutes;
      thisWeek.distanceKm += activity.distanceKm ?? 0;
    }
  }

  return {
    totalActivities: activities.length,
    thisWeek: {
      activities: thisWeek.activities,
      durationMinutes: thisWeek.durationMinutes,
      distanceKm: round(thisWeek.distanceKm),
    },
    currentStreakDays: countStreak(activeDays, now),
    byType: activityTypes
      .map((type) => {
        const bucket = byType.get(type) ?? { count: 0, durationMinutes: 0, distanceKm: 0 };
        return { type, count: bucket.count, durationMinutes: bucket.durationMinutes, distanceKm: round(bucket.distanceKm) };
      })
      .filter((entry) => entry.count > 0),
  };
}

/**
 * Counts consecutive days with activity ending today. A gap yesterday still
 * counts today as a 1-day streak; a gap today breaks it to 0.
 */
function countStreak(activeDays: Set<string>, now: Date): number {
  let streak = 0;
  for (let offset = 0; ; offset += 1) {
    const day = toIsoDay(new Date(now.getTime() - offset * MS_PER_DAY));
    if (!activeDays.has(day)) break;
    streak += 1;
  }
  return streak;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
