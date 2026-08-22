import { Router } from "express";
import { createReleaseController } from "./release.controller.js";
import { InMemoryReleaseRepository } from "./release.repository.js";
import { ReleaseService } from "./release.service.js";

const router = Router();
const controller = createReleaseController(new ReleaseService(new InMemoryReleaseRepository()));

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
