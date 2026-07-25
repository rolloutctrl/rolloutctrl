import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import type { Project } from '@/entities/Project';

export type FeatureFlag = {
  id: string;
  key: string;
  description?: string;
  archived: boolean;
  projectId: string;
  project: Project;
  isFavorite: boolean;

  environments: FeatureFlagEnvironment[];

  createdByEmail: string;
  createdById: string;
  createdByName: string;

  createdAt: Date;
  updatedAt: Date;
};

export type FeatureFlagsResponse = {
  data: FeatureFlag[];
  nextCursor: string | null;
  hasMore: boolean;
};
