import { apiRequest } from "../../../lib/http";
import type {
  Activity,
  ActivityStats,
  ActivityType,
  CreateActivityInput,
  UpdateActivityInput,
} from "../types";

const BASE_URL = "/api/v1/activities";

export const activityApi = {
  list: (type?: ActivityType): Promise<Activity[]> =>
    apiRequest(type ? `${BASE_URL}?type=${encodeURIComponent(type)}` : BASE_URL),

  stats: (): Promise<ActivityStats> => apiRequest(`${BASE_URL}/stats`),

  create: (input: CreateActivityInput): Promise<Activity> =>
    apiRequest(BASE_URL, { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: UpdateActivityInput): Promise<Activity> =>
    apiRequest(`${BASE_URL}/${id}`, { method: "PATCH", body: JSON.stringify(input) }),

  remove: (id: string): Promise<void> =>
    apiRequest(`${BASE_URL}/${id}`, { method: "DELETE" }),
};
