import type { ActionEffect, MatchType, Operator } from '@/shared/types/enums';

export type EditActionStrategyRuleFormState = {
  id?: string;
  field: string;
  operator: Operator;
  value: string | string[];
  not?: boolean;
};

export type EditActionStrategyFormState = {
  id?: string;
  name?: string;
  priority?: number;
  enabled?: boolean;
  effect: ActionEffect;
  segmentId?: string;
  matchType: MatchType;
  rules: EditActionStrategyRuleFormState[];
};

export type EditActionFormState = {
  key: string;
  description?: string;
  enabled?: boolean;
  defaultEffect: ActionEffect;
  strategies: EditActionStrategyFormState[];
};

export type UpdateActionBody = {
  key?: string;
  description?: string;
  enabled?: boolean;
  defaultEffect?: ActionEffect;
  strategies?: {
    id?: string;
    effect: ActionEffect;
    priority?: number;
    enabled?: boolean;
    segmentIds?: string[];
    matchType: MatchType;
    rules: {
      id?: string;
      field: string;
      operator: Operator;
      value: string;
      not?: boolean;
    }[];
  }[];
};
