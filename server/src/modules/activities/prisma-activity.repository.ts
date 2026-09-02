import type { ActivityListFilter, ActivityRepository } from "./activity.repository.js";
import type {
  Activity,
  ActivityType,
  CreateActivityInput,
  UpdateActivityInput,
} from "./activity.types.js";

// Dynamically imported so the server still starts without a generated Prisma client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

function toActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    type: row.type as ActivityType,
    title: row.title as string,
    date: row.date as string,
    durationMinutes: row.durationMinutes as number,
    distanceKm: (row.distanceKm as number | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

export class PrismaActivityRepository implements ActivityRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(filter: ActivityListFilter = {}): Promise<Activity[]> {
    const rows = await this.db.activity.findMany({
      where: filter.type ? { type: filter.type } : undefined,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toActivity);
  }

  async findById(id: string): Promise<Activity | null> {
    const row = await this.db.activity.findUnique({ where: { id } });
    return row ? toActivity(row) : null;
  }

  async create(input: CreateActivityInput & { source?: string; externalId?: string }): Promise<Activity> {
    const row = await this.db.activity.create({
      data: {
        type: input.type,
        title: input.title,
        date: input.date,
        durationMinutes: input.durationMinutes,
        distanceKm: input.distanceKm ?? null,
        notes: input.notes ?? null,
        source: input.source ?? "manual",
        externalId: input.externalId ?? null,
      },
    });
    return toActivity(row);
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity | null> {
    try {
      const row = await this.db.activity.update({
        where: { id },
        data: {
          ...(input.type !== undefined && { type: input.type }),
          ...(input.title !== undefined && { title: input.title }),
          ...(input.date !== undefined && { date: input.date }),
          ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
          ...(input.distanceKm !== undefined && { distanceKm: input.distanceKm ?? null }),
          ...(input.notes !== undefined && { notes: input.notes ?? null }),
        },
      });
      return toActivity(row);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.activity.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
