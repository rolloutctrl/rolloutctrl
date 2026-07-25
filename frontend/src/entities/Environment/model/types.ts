import type { FeatureFlagEnvironment } from "@/entities/FeatureFlagEnvironment";
import type { Project } from "@/entities/Project";

export type Environment = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  project: Project;

  isSystem: boolean;

  featureFlags: FeatureFlagEnvironment[];

  actionRules: string[];

  versions: EnvironmentVersion[];
  createdAt: Date;
  updatedAt: Date;
};

export type EnvironmentVersion = {
  environmentId: string;
  version: number;
  environment: Environment;
  updatedAt: Date;
};

export type EnvironmentWithCounts = Environment & {
  enabledFlagsCount: number;
};

