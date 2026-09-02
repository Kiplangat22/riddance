import { Router, type Request, type Response } from "express";
import { InMemoryActivityRepository } from "../activities/activity.repository.js";
import { parseCSV, parseGPX, importRows } from "./import.service.js";
import { AppError } from "../../shared/errors/app-error.js";

const router: Router = Router();

async function getRepository() {
  if (process.env["DATABASE_URL"]) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — generated at runtime via `prisma generate`
      const { PrismaClient } = await import("../../generated/prisma/index.js");
      const { PrismaActivityRepository } = await import(
        "../activities/prisma-activity.repository.js"
      );
      return new PrismaActivityRepository(new PrismaClient());
    } catch {
      // fall through to in-memory
    }
  }
  return new InMemoryActivityRepository();
}

/**
 * POST /api/v1/import/csv
 * Body: { csv: "<csv text>" }
 */
router.post("/csv", async (req: Request, res: Response) => {
  const { csv } = req.body as { csv?: string };
  if (!csv || typeof csv !== "string") throw new AppError("csv field is required", 400);

  const rows = parseCSV(csv);
  if (rows.length === 0) throw new AppError("No valid rows found in CSV", 400);

  const repository = await getRepository();
  const result = await importRows(rows, repository);
  res.json({ success: true, data: result });
});

/**
 * POST /api/v1/import/gpx
 * Body: { gpx: "<gpx xml string>" }
 */
router.post("/gpx", async (req: Request, res: Response) => {
  const { gpx } = req.body as { gpx?: string };
  if (!gpx || typeof gpx !== "string") throw new AppError("gpx field is required", 400);

  const row = parseGPX(gpx);
  if (!row) throw new AppError("Could not parse GPX — ensure it contains track points", 400);

  const repository = await getRepository();
  const result = await importRows([row], repository);
  res.json({ success: true, data: result });
});

/**
 * POST /api/v1/import/json
 * Body: { activities: Array<{type, title, date, durationMinutes, distanceKm?, notes?}> }
 */
router.post("/json", async (req: Request, res: Response) => {
  const { activities } = req.body as { activities?: unknown[] };
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new AppError("activities array is required", 400);
  }

  const csvLines = ["type,title,date,duration_minutes,distance_km,notes"].concat(
    activities.map((a) => {
      const act = a as Record<string, unknown>;
      return [
        act["type"] ?? "Workout",
        `"${String(act["title"] ?? act["name"] ?? "Imported activity").replace(/"/g, '""')}"`,
        String(act["date"] ?? "").slice(0, 10),
        act["durationMinutes"] ?? act["duration_minutes"] ?? 30,
        act["distanceKm"] ?? act["distance_km"] ?? "",
        `"${String(act["notes"] ?? "").replace(/"/g, '""')}"`,
      ].join(",");
    }),
  );

  const rows = parseCSV(csvLines.join("\n"));
  const repository = await getRepository();
  const result = await importRows(rows, repository);
  res.json({ success: true, data: result });
});

export default router;
