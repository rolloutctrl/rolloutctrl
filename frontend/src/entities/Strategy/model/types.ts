import type { ActionStrategy } from "@/entities/ActionStrategy";
import type { FeatureFlagEnvironment } from "@/entities/FeatureFlagEnvironment";
import type { Segment } from "@/entities/Segment";
import type { StrategyVariant } from "@/entities/Variant";
import type { Operator } from "@/shared/types/enums";
import type { Nullable } from "@/shared/types/types";

export type Strategy = {
  id: string;
  name?: string;
  isDefault: boolean;

  enabled: boolean;

  featureFlagEnvironmentId: string;

  rolloutPercentage: Nullable<number>;
  rolloutStickinessField: Nullable<string>;
  priority: number;

  timezone: Nullable<string>;
  startsAt: Nullable<Date | string>;
  endsAt: Nullable<Date | string>;

  featureFlagEnvironment: FeatureFlagEnvironment;

  rules: StrategyRule[];
  segments: Segment[];
  actionStrategies: ActionStrategy[];
  strategyVariants: StrategyVariant[];

  createdAt: Date;
  updatedAt: Date;
};

export type StrategyRule = {
  id: string;
  strategyId: string;
  field: string;
  operator: Operator;
  value: string;
  not: boolean;

  strategy: Strategy;

  createdAt: Date;
  updatedAt: Date;
};
