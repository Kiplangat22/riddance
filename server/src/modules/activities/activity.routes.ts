import { Router } from "express";
import { createActivityController } from "./activity.controller.js";
import { InMemoryActivityRepository } from "./activity.repository.js";
import { ActivityService } from "./activity.service.js";

const router: Router = Router();
const controller = createActivityController(
  new ActivityService(new InMemoryActivityRepository()),
);

router.get("/", controller.list);
router.get("/stats", controller.stats);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
