import { describe, expect, it } from "vitest";
import { buildActivityStats } from "./activity.stats.js";
import type { Activity } from "./activity.types.js";

const NOW = new Date("2026-03-15T09:00:00.000Z");

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: crypto.randomUUID(),
    type: "Run",
    title: "Easy run",
    date: "2026-03-15",
    durationMinutes: 30,
    distanceKm: 5,
    notes: null,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("buildActivityStats", () => {
  it("returns an empty summary when there are no activities", () => {
    const stats = buildActivityStats([], NOW);
    expect(stats).toEqual({
      totalActivities: 0,
      thisWeek: { activities: 0, durationMinutes: 0, distanceKm: 0 },
      currentStreakDays: 0,
      byType: [],
    });
  });

  it("aggregates weekly totals across the trailing 7 days", () => {
    const stats = buildActivityStats(
      [
        activity({ date: "2026-03-15", distanceKm: 5, durationMinutes: 30 }),
        activity({ date: "2026-03-10", distanceKm: 8, durationMinutes: 45 }),
        activity({ date: "2026-03-01", distanceKm: 10, durationMinutes: 60 }), // outside the window
      ],
      NOW,
    );

    expect(stats.thisWeek).toEqual({ activities: 2, durationMinutes: 75, distanceKm: 13 });
    expect(stats.totalActivities).toBe(3);
  });

  it("counts a consecutive day streak ending today", () => {
    const stats = buildActivityStats(
      [
        activity({ date: "2026-03-15" }),
        activity({ date: "2026-03-14" }),
        activity({ date: "2026-03-13" }),
        activity({ date: "2026-03-11" }), // gap on the 12th breaks the streak here
      ],
      NOW,
    );

    expect(stats.currentStreakDays).toBe(3);
  });

  it("reports a zero streak when there is no activity today", () => {
    const stats = buildActivityStats([activity({ date: "2026-03-14" })], NOW);
    expect(stats.currentStreakDays).toBe(0);
  });

  it("breaks totals down by type and omits unused types", () => {
    const stats = buildActivityStats(
      [
        activity({ type: "Run", distanceKm: 5, durationMinutes: 30 }),
        activity({ type: "Run", distanceKm: 6, durationMinutes: 35 }),
        activity({ type: "Sleep", distanceKm: null, durationMinutes: 480 }),
      ],
      NOW,
    );

    expect(stats.byType).toEqual([
      { type: "Run", count: 2, durationMinutes: 65, distanceKm: 11 },
      { type: "Sleep", count: 1, durationMinutes: 480, distanceKm: 0 },
    ]);
  });
});
