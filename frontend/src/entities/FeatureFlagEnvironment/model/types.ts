import type { Environment } from "@/entities/Environment";
import type { FeatureFlag } from "@/entities/FeatureFlag";
import type { Strategy } from "@/entities/Strategy";
import type { Variant } from "@/entities/Variant";
import type { Nullable } from "@/shared/types/types";

export type FeatureFlagEnvironment = {
  id: string;
  featureFlagId: string;
  environmentId: string;

  enabled: boolean;

  rolloutPercentage: Nullable<number>;

  featureFlag: FeatureFlag;
  environment: Environment;
  strategies: Strategy[];
  variants: Variant[];

  createdAt: Date;
  updatedAt: Date;
};
