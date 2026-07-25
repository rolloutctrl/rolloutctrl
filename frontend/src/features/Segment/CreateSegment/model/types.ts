import type { Operator } from '@/shared/types/enums';

export type CreateSegmentRuleFormState = {
  field: string;
  operator: Operator;
  value: string | string[];
  priority?: number;
  not?: boolean;
};

export type CreateSegmentFormState = {
  projectId: string;
  key: string;
  name: string;
  description?: string;
  rules?: CreateSegmentRuleFormState[];
};
