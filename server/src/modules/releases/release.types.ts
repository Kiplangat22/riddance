export const releaseCategories = ["Digital", "Home", "Work", "Mindset", "Boundaries"] as const;

export type ReleaseCategory = (typeof releaseCategories)[number];

export interface Release {
  id: string;
  title: string;
  category: ReleaseCategory;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseInput {
  title: string;
  category: ReleaseCategory;
}

export interface UpdateReleaseInput {
  title?: string;
  category?: ReleaseCategory;
  completed?: boolean;
}
