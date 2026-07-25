import type { Operator } from '@/shared/types/enums';

export type EditSegmentRuleFormState = {
  id: string;
  field: string;
  operator: Operator;
  value: string | string[];
  not?: boolean;
  priority?: number;
};

export type EditSegmentFormState = {
  id: string;
  projectId: string;
  key: string;
  name: string;
  description?: string | null;
  rules?: EditSegmentRuleFormState[];
};
