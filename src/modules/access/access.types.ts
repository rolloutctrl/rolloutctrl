import { Operator } from 'src/common/generated/prisma/enums';
import { RuleValue } from 'src/common/types/common';

export type CanInput = {
  roles: string[];
  attributes?: Record<string, any>;
  action: string;
  projectId: string;
  environment: string;
  userId?: string;
  kind?: string;
  key?: string;
};

export type CanResult = {
  allowed: boolean;
  reason: string[];
};

export type EvaluateRuleInput = {
  field: string;
  operator: Operator;
  value: RuleValue;
  not?: boolean;
};

export type OperatorEvaluator = (
  actualValue: unknown,
  expectedValue: RuleValue,
) => boolean;

export type EvaluateFlagInput = {
  flagKey: string;
  projectId: string;
  environment: string;
  attributes?: Record<string, any>;
  userId?: string;
  kind?: string;
  key?: string;
};

export type EvaluateFlagResult = {
  enabled: boolean;
  reason: string;
  strategy?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
    payload: string | number | boolean | Record<string, any>;
    payloadType: string;
  };
};
