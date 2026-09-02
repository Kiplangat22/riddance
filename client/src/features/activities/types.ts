export const activityTypes = ["Run", "Walk", "Ride", "Workout", "Sleep", "Meditation"] as const;

export type ActivityType = (typeof activityTypes)[number];

export const distanceActivityTypes: readonly ActivityType[] = ["Run", "Walk", "Ride"];

export function typeSupportsDistance(type: ActivityType): boolean {
  return distanceActivityTypes.includes(type);
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  durationMinutes: number;
  distanceKm: number | null;
  notes: string | null;
  source?: string;
  externalId?: string | null;
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

export type UpdateActivityInput = Partial<CreateActivityInput>;

export interface ActivityTypeBreakdown {
  type: ActivityType;
  count: number;
  durationMinutes: number;
  distanceKm: number;
}

export interface ActivityStats {
  totalActivities: number;
  thisWeek: {
    activities: number;
    durationMinutes: number;
    distanceKm: number;
  };
  currentStreakDays: number;
  byType: ActivityTypeBreakdown[];
}
