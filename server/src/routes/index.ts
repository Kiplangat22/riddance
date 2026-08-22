import express from "express";
import healthRoutes from "../modules/health/health.routes.js";
import releaseRoutes from "../modules/releases/release.routes.js";

const router: express.Router = express.Router();

router.use("/health", healthRoutes);
router.use("/releases", releaseRoutes);

export default router;
