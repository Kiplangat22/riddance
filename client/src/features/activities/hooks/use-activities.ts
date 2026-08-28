import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/http";
import { activityApi } from "../api/activity-api";
import type {
  Activity,
  ActivityStats,
  ActivityType,
  CreateActivityInput,
  UpdateActivityInput,
} from "../types";

interface UseActivitiesResult {
  activities: Activity[];
  stats: ActivityStats | null;
  isLoading: boolean;
  error: string | null;
  filter: ActivityType | "All";
  setFilter: (filter: ActivityType | "All") => void;
  reload: () => Promise<void>;
  create: (input: CreateActivityInput) => Promise<void>;
  update: (id: string, input: UpdateActivityInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export function useActivities(): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityType | "All">("All");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [list, summary] = await Promise.all([
        activityApi.list(filter === "All" ? undefined : filter),
        activityApi.stats(),
      ]);
      setActivities(list);
      setStats(summary);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(
    async (operation: () => Promise<unknown>) => {
      setError(null);
      try {
        await operation();
        await load();
      } catch (err) {
        setError(messageFor(err));
      }
    },
    [load],
  );

  return {
    activities,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    reload: load,
    create: (input) => mutate(() => activityApi.create(input)),
    update: (id, input) => mutate(() => activityApi.update(id, input)),
    remove: (id) => mutate(() => activityApi.remove(id)),
  };
}
