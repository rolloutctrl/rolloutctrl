import type { ActionEffect, MatchType, Operator } from '@/shared/types/enums';

export type CreateActionStrategyRuleFormState = {
  field: string;
  operator: Operator;
  value: string | string[];
  not?: boolean;
};

export type CreateActionStrategyFormState = {
  name?: string;
  priority?: number;
  enabled?: boolean;
  effect: ActionEffect;
  segmentId?: string;
  matchType: MatchType;
  rules: CreateActionStrategyRuleFormState[];
};

export type CreateActionFormState = {
  projectId: string;
  key: string;
  description?: string;
  enabled?: boolean;
  defaultEffect: ActionEffect;
  strategies: CreateActionStrategyFormState[];
};

export type CreateActionBody = {
  projectId: string;
  key: string;
  description?: string;
  enabled?: boolean;
  defaultEffect: ActionEffect;
  strategies?: {
    effect: ActionEffect;
    priority?: number;
    enabled?: boolean;
    segmentIds?: string[];
    matchType: MatchType;
    rules: {
      field: string;
      operator: Operator;
      value: string;
      not?: boolean;
    }[];
  }[];
};
