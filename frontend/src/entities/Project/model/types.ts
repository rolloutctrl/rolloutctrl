import type { User } from '@/entities/User';
import type { ApiKeyType } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

export type Project = {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  slug: string;
  contextSettings: {
    projectId: string;
    collectContexts: boolean;
    allowedAttributes: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithCounts = Project & {
  activeFlagsCount: number;
  activeActionsCount: number;
  environmentsCount: number;
};

export type ProjectWithStats = Project & {
  totalActiveActions: number;
  totalActiveFlags: number;
  warningCount: number;
  errorCount: number;
};

export type ApiKey = {
  id: string;
  name: string;
  keyHash: string;
  type: ApiKeyType;
  projectId: string;
  environmentId: string;

  previewKey: string;

  allowedOrigins: string[];

  project: Project;

  createdAt: string;
  revokedAt?: Nullable<string>;
};

export type ApiKeyBasic = {
  id: string;
  key: string;
  name: string;
  type: ApiKeyType;
  allowedOrigins: string;
  projectId: string;
  environmentId: string;
  environmentName: string;
  createdAt: Date;
  revokedAt: Nullable<Date>;
};

export type ProjectMember = {
  id: string;
  project: Project;
  projectId: string;
  role: string;
  userId: string;

  user: User;
};

export type ProjectOverview = {
  featureFlags: {
    total: number;
    active: number;
  };
  segments: {
    total: number;
    active: number;
  };
  actions: {
    total: number;
    active: number;
  };
  members: (ProjectMember & {
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      role: string;
    };
  })[];
  environments: {
    id: string;
    name: string;
    activeFeatureFlags: number;
  }[];
  activeRollouts: {
    flagKey: string;
    env: string;
    rolloutPercentage: number;
  }[];
};
