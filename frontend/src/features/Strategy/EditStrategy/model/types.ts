import type { Operator, VariantPayloadType } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

export type EditStrategyVariantFormState = {
  name: string;
  description?: string;
  weight: number;
  payload?: string;
  payloadType?: VariantPayloadType;
  isWeightLocked: boolean;
};

export type EditStrategyRuleFormState = {
  field: string;
  operator: Operator;
  value: string | string[];
  not?: boolean;
};

export type EditStrategyFormState = {
  projectId: string;
  featureFlagEnvironmentIds: string[];
  name?: string;
  isDefault?: boolean;
  rolloutPercentage?: number;
  rolloutStickinessField?: string;
  segmentIds?: string[];
  priority?: number;
  timezone?: string;
  startsAt?: Nullable<string>;
  endsAt?: Nullable<string>;
  rules?: EditStrategyRuleFormState[];
  // variants?: EditStrategyVariantFormState[];
};
