import { Router, type Request, type Response, type NextFunction } from "express";
import { createActivityController } from "./activity.controller.js";
import { InMemoryActivityRepository } from "./activity.repository.js";
import { PrismaActivityRepository } from "./prisma-activity.repository.js";
import { ActivityService } from "./activity.service.js";

async function buildRepository() {
  if (process.env["DATABASE_URL"]) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — generated at runtime via `prisma generate`
      const { PrismaClient } = await import("../../generated/prisma/index.js");
      const db = new PrismaClient();
      return new PrismaActivityRepository(db);
    } catch {
      console.warn(
        "Prisma client unavailable — using in-memory store. Run `prisma generate && prisma migrate dev` to enable persistence.",
      );
    }
  }
  return new InMemoryActivityRepository();
}

let controller: ReturnType<typeof createActivityController> | null = null;
const ready = buildRepository().then((repo) => {
  controller = createActivityController(new ActivityService(repo));
});

type Handler = (req: Request, res: Response) => Promise<void>;

function wrap(pick: (c: ReturnType<typeof createActivityController>) => Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    void ready
      .then(() => {
        if (!controller) throw new Error("Activity controller not ready");
        return pick(controller)(req, res);
      })
      .catch(next);
  };
}

const router: Router = Router();

router.get("/", wrap((c) => c.list));
router.get("/stats", wrap((c) => c.stats));
router.get("/:id", wrap((c) => c.getById));
router.post("/", wrap((c) => c.create));
router.patch("/:id", wrap((c) => c.update));
router.delete("/:id", wrap((c) => c.remove));

export default router;
