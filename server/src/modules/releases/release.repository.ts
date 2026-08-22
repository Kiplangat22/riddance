import type { CreateReleaseInput, Release, UpdateReleaseInput } from "./release.types.js";

export interface ReleaseRepository {
  findAll(): Promise<Release[]>;
  findById(id: string): Promise<Release | null>;
  create(input: CreateReleaseInput): Promise<Release>;
  update(id: string, input: UpdateReleaseInput): Promise<Release | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryReleaseRepository implements ReleaseRepository {
  private readonly releases = new Map<string, Release>();

  async findAll(): Promise<Release[]> {
    return [...this.releases.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<Release | null> {
    return this.releases.get(id) ?? null;
  }

  async create(input: CreateReleaseInput): Promise<Release> {
    const now = new Date().toISOString();
    const release: Release = {
      id: crypto.randomUUID(),
      title: input.title,
      category: input.category,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.releases.set(release.id, release);
    return release;
  }

  async update(id: string, input: UpdateReleaseInput): Promise<Release | null> {
    const current = this.releases.get(id);
    if (!current) return null;

    const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
    this.releases.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.releases.delete(id);
  }
}
