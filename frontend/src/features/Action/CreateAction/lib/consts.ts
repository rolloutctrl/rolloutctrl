import { ActionEffect } from '@/shared/types/enums';
import type { CreateActionFormState, CreateActionStrategyRuleFormState } from '../model/types';

export const createActionFormDefaultState: CreateActionFormState = {
  projectId: '',
  key: '',
  description: '',
  enabled: true,
  defaultEffect: ActionEffect.DENY,
  strategies: [],
};

export const createActionStrategyRuleDefaultState: CreateActionStrategyRuleFormState = {
  field: '',
  operator: 'EQUALS' as const,
  value: '',
  not: false,
};
