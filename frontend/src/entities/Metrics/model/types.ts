import type { FeatureFlag } from '@/entities/FeatureFlag';
import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import type { Project } from '@/entities/Project';
import type { Strategy } from '@/entities/Strategy';
import type { Variant } from '@/entities/Variant';
import type { MetricType } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

export type MetricsBucket = {
  id: string;

  projectId: string;
  featureFlagEnvironmentId: string;

  featureFlagId?: Nullable<string>;
  strategyId?: Nullable<string>;
  variantId?: Nullable<string>;

  type: MetricType;

  count: number;

  bucketDate: Date | string;

  project: Project;
  featureFlagEnvironment: FeatureFlagEnvironment;

  featureFlag?: Nullable<FeatureFlag>;
  strategy?: Nullable<Strategy>;
  variant?: Nullable<Variant>;

  createdAt: Date;
  updatedAt: Date;
};

export type MetricsFlag = {
  exposures: number;
  timeline: {
    exposures: number;
    date: string;
  }[];
  byEnvironment: {
    environmentId: string;
    environmentName: string;
    exposures: number;
  }[];
};
