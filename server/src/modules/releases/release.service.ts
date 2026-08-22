import { AppError } from "../../shared/errors/app-error.js";
import type { CreateReleaseInput, Release, UpdateReleaseInput } from "./release.types.js";
import type { ReleaseRepository } from "./release.repository.js";

export class ReleaseService {
  constructor(private readonly repository: ReleaseRepository) {}

  list(): Promise<Release[]> {
    return this.repository.findAll();
  }

  create(input: CreateReleaseInput): Promise<Release> {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateReleaseInput): Promise<Release> {
    const release = await this.repository.update(id, input);
    if (!release) throw new AppError("Release not found", 404);
    return release;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new AppError("Release not found", 404);
  }
}
