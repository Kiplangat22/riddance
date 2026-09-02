import express from "express";
import healthRoutes from "../modules/health/health.routes.js";
import activityRoutes from "../modules/activities/activity.routes.js";
import stravaRoutes from "../modules/integrations/strava.routes.js";
import importRoutes from "../modules/import/import.routes.js";

const router: express.Router = express.Router();

router.use("/health", healthRoutes);
router.use("/activities", activityRoutes);
router.use("/integrations/strava", stravaRoutes);
router.use("/import", importRoutes);

export default router;
