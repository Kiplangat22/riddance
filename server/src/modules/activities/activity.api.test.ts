import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";

/**
 * End-to-end checks through the real Express stack (helmet, validation, error
 * middleware). The activities router keeps an in-memory store for the process,
 * so these run as one ordered scenario.
 */
describe("activities API", () => {
  it("rejects an invalid payload with a 400 and field issues", async () => {
    const res = await request(app).post("/api/v1/activities").send({ type: "Run" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: "title" })]));
  });

  it("creates, reads, updates and deletes an activity", async () => {
    const created = await request(app)
      .post("/api/v1/activities")
      .send({ type: "Run", title: "Morning run", date: "2026-03-15", durationMinutes: 32, distanceKm: 6.2 });
    expect(created.status).toBe(201);
    const { id } = created.body.data;

    const list = await request(app).get("/api/v1/activities");
    expect(list.body.data.some((a: { id: string }) => a.id === id)).toBe(true);

    const patched = await request(app).patch(`/api/v1/activities/${id}`).send({ durationMinutes: 35 });
    expect(patched.status).toBe(200);
    expect(patched.body.data.durationMinutes).toBe(35);

    const stats = await request(app).get("/api/v1/activities/stats");
    expect(stats.status).toBe(200);
    expect(stats.body.data.totalActivities).toBeGreaterThanOrEqual(1);

    const removed = await request(app).delete(`/api/v1/activities/${id}`);
    expect(removed.status).toBe(204);

    const missing = await request(app).get(`/api/v1/activities/${id}`);
    expect(missing.status).toBe(404);
  });

  it("returns a 404 (not a 500) for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
