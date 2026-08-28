export const activityTypes = ["Run", "Walk", "Ride", "Workout", "Sleep", "Meditation"] as const;

export type ActivityType = (typeof activityTypes)[number];

/**
 * Activity types where a distance (in kilometres) is meaningful. Sleep,
 * workouts and meditation are duration-only.
 */
export const distanceActivityTypes: readonly ActivityType[] = ["Run", "Walk", "Ride"];

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  /** Calendar day the activity happened, as an ISO `YYYY-MM-DD` string. */
  date: string;
  durationMinutes: number;
  /** Only set for distance-based activities (Run/Walk/Ride). */
  distanceKm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  type: ActivityType;
  title: string;
  date: string;
  durationMinutes: number;
  distanceKm?: number | null;
  notes?: string | null;
}

export interface UpdateActivityInput {
  type?: ActivityType;
  title?: string;
  date?: string;
  durationMinutes?: number;
  distanceKm?: number | null;
  notes?: string | null;
}

export interface ActivityTypeBreakdown {
  type: ActivityType;
  count: number;
  durationMinutes: number;
  distanceKm: number;
}

export interface ActivityStats {
  totalActivities: number;
  /** Totals across the trailing 7 calendar days (including today). */
  thisWeek: {
    activities: number;
    durationMinutes: number;
    distanceKm: number;
  };
  /** Consecutive days up to today that have at least one activity. */
  currentStreakDays: number;
  byType: ActivityTypeBreakdown[];
}
