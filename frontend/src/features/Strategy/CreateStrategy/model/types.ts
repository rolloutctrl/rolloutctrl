import type { Operator, VariantPayloadType } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';
import type { AssignVariantItem } from '@/features/Strategy/AssignStrategyVariant';

export type CreateStrategyVariantFormState = {
  name: string;
  description?: string;
  weight: number;
  payload?: string;
  payloadType?: VariantPayloadType;
  isWeightLocked: boolean;
};

export type CreateStrategyRuleFormState = {
  field: string;
  operator: Operator;
  value: string | string[];
  not?: boolean;
};

export type CreateStrategyFormState = {
  projectId: string;
  featureFlagEnvironmentIds: string[];
  name?: string;
  isDefault?: boolean;
  rolloutPercentage?: number;
  rolloutStickinessField?: string;
  segmentIds?: string[];
  priority?: number;
  startsAt?: Nullable<string>;
  endsAt?: Nullable<string>;
  timezone?: string;
  rules?: CreateStrategyRuleFormState[];
  variants?: AssignVariantItem[];
};
