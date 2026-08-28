import type { Request, Response } from "express";
import { requireParam } from "../../shared/http/request-params.js";
import {
  createActivitySchema,
  listActivityQuerySchema,
  updateActivitySchema,
} from "./activity.schemas.js";
import type { ActivityService } from "./activity.service.js";

/**
 * Builds the HTTP handlers for the activities resource. Express 5 forwards
 * rejected promises to the error middleware, so handlers can stay `async`
 * without a manual try/catch wrapper.
 */
export function createActivityController(service: ActivityService) {
  return {
    list: async (req: Request, res: Response): Promise<void> => {
      const { type } = listActivityQuerySchema.parse(req.query);
      res.json({ success: true, data: await service.list({ type }) });
    },
    stats: async (_req: Request, res: Response): Promise<void> => {
      res.json({ success: true, data: await service.stats() });
    },
    getById: async (req: Request, res: Response): Promise<void> => {
      res.json({ success: true, data: await service.getById(requireParam(req, "id")) });
    },
    create: async (req: Request, res: Response): Promise<void> => {
      const activity = await service.create(createActivitySchema.parse(req.body));
      res.status(201).json({ success: true, data: activity });
    },
    update: async (req: Request, res: Response): Promise<void> => {
      const activity = await service.update(requireParam(req, "id"), updateActivitySchema.parse(req.body));
      res.json({ success: true, data: activity });
    },
    remove: async (req: Request, res: Response): Promise<void> => {
      await service.remove(requireParam(req, "id"));
      res.status(204).send();
    },
  };
}
