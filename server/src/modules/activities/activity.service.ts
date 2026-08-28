import { AppError } from "../../shared/errors/app-error.js";
import { buildActivityStats } from "./activity.stats.js";
import { distanceActivityTypes } from "./activity.types.js";
import type {
  Activity,
  ActivityStats,
  CreateActivityInput,
  UpdateActivityInput,
} from "./activity.types.js";
import type { ActivityListFilter, ActivityRepository } from "./activity.repository.js";

export class ActivityService {
  constructor(private readonly repository: ActivityRepository) {}

  list(filter?: ActivityListFilter): Promise<Activity[]> {
    return this.repository.findAll(filter);
  }

  async getById(id: string): Promise<Activity> {
    const activity = await this.repository.findById(id);
    if (!activity) throw new AppError("Activity not found", 404);
    return activity;
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    this.assertDistanceMatchesType(input.type, input.distanceKm);
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity> {
    const current = await this.repository.findById(id);
    if (!current) throw new AppError("Activity not found", 404);

    const nextType = input.type ?? current.type;
    const nextDistance = input.distanceKm === undefined ? current.distanceKm : input.distanceKm;
    this.assertDistanceMatchesType(nextType, nextDistance);

    const updated = await this.repository.update(id, input);
    if (!updated) throw new AppError("Activity not found", 404);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new AppError("Activity not found", 404);
  }

  async stats(): Promise<ActivityStats> {
    return buildActivityStats(await this.repository.findAll());
  }

  private assertDistanceMatchesType(type: Activity["type"], distanceKm: number | null | undefined): void {
    if (distanceKm != null && !distanceActivityTypes.includes(type)) {
      throw new AppError(`Distance can only be set for ${distanceActivityTypes.join(", ")} activities`, 422);
    }
  }
}
