import type { Request, Response } from "express";
import { createReleaseSchema, updateReleaseSchema } from "./release.schemas.js";
import type { ReleaseService } from "./release.service.js";

export function createReleaseController(service: ReleaseService) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      res.json({ success: true, data: await service.list() });
    },
    create: async (req: Request, res: Response): Promise<void> => {
      const release = await service.create(createReleaseSchema.parse(req.body));
      res.status(201).json({ success: true, data: release });
    },
    update: async (req: Request, res: Response): Promise<void> => {
      const release = await service.update(req.params.id, updateReleaseSchema.parse(req.body));
      res.json({ success: true, data: release });
    },
    remove: async (req: Request, res: Response): Promise<void> => {
      await service.remove(req.params.id);
      res.status(204).send();
    },
  };
}
