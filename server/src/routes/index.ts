import express from "express";
import healthRoutes from "../modules/health/health.routes.js";
import activityRoutes from "../modules/activities/activity.routes.js";

const router: express.Router = express.Router();

router.use("/health", healthRoutes);
router.use("/activities", activityRoutes);

export default router;
