import { beforeEach, describe, expect, it } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { InMemoryActivityRepository } from "./activity.repository.js";
import { ActivityService } from "./activity.service.js";
import type { CreateActivityInput } from "./activity.types.js";

const runInput: CreateActivityInput = {
  type: "Run",
  title: "Tempo run",
  date: "2026-03-15",
  durationMinutes: 40,
  distanceKm: 8,
};

describe("ActivityService", () => {
  let service: ActivityService;

  beforeEach(() => {
    service = new ActivityService(new InMemoryActivityRepository());
  });

  it("creates and lists activities newest-first by date", async () => {
    await service.create({ ...runInput, date: "2026-03-10", title: "Older" });
    await service.create({ ...runInput, date: "2026-03-15", title: "Newer" });

    const all = await service.list();
    expect(all.map((a) => a.title)).toEqual(["Newer", "Older"]);
  });

  it("filters the list by type", async () => {
    await service.create(runInput);
    await service.create({ type: "Sleep", title: "Night", date: "2026-03-15", durationMinutes: 470 });

    const sleeps = await service.list({ type: "Sleep" });
    expect(sleeps).toHaveLength(1);
    expect(sleeps[0]?.type).toBe("Sleep");
  });

  it("rejects a distance on a non-distance activity", async () => {
    await expect(
      service.create({ type: "Sleep", title: "Nap", date: "2026-03-15", durationMinutes: 30, distanceKm: 2 }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("rejects a distance introduced by changing type on update", async () => {
    const run = await service.create(runInput);
    await expect(service.update(run.id, { type: "Sleep" })).rejects.toMatchObject({ statusCode: 422 });
  });

  it("throws a 404 when updating or deleting an unknown id", async () => {
    await expect(service.update("missing", { title: "x" })).rejects.toMatchObject({ statusCode: 404 });
    await expect(service.remove("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("clears distance when explicitly set to null on update", async () => {
    const run = await service.create(runInput);
    const updated = await service.update(run.id, { distanceKm: null });
    expect(updated.distanceKm).toBeNull();
  });
});
