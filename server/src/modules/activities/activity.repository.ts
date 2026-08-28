import type {
  Activity,
  ActivityType,
  CreateActivityInput,
  UpdateActivityInput,
} from "./activity.types.js";

export interface ActivityListFilter {
  type?: ActivityType;
}

export interface ActivityRepository {
  findAll(filter?: ActivityListFilter): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  create(input: CreateActivityInput): Promise<Activity>;
  update(id: string, input: UpdateActivityInput): Promise<Activity | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Process-memory implementation. Data resets when the server restarts; swap for
 * a Prisma-backed repository when persistence is wired up.
 */
export class InMemoryActivityRepository implements ActivityRepository {
  private readonly activities = new Map<string, Activity>();

  async findAll(filter: ActivityListFilter = {}): Promise<Activity[]> {
    return [...this.activities.values()]
      .filter((activity) => !filter.type || activity.type === filter.type)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activities.get(id) ?? null;
  }

  async create(input: CreateActivityInput): Promise<Activity> {
    const now = new Date().toISOString();
    const activity: Activity = {
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title,
      date: input.date,
      durationMinutes: input.durationMinutes,
      distanceKm: input.distanceKm ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity | null> {
    const current = this.activities.get(id);
    if (!current) return null;

    const updated: Activity = {
      ...current,
      ...input,
      distanceKm: input.distanceKm === undefined ? current.distanceKm : (input.distanceKm ?? null),
      notes: input.notes === undefined ? current.notes : (input.notes ?? null),
      updatedAt: new Date().toISOString(),
    };
    this.activities.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }
}
