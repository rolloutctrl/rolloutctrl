import { Operator } from '../generated/prisma/enums';
import { OperatorConfig } from '../types/common';

export const OPERATOR_CONFIG: Record<Operator, OperatorConfig> = {
  [Operator.EQUALS]: {
    supportsNot: true,
  },

  [Operator.IN]: {
    supportsNot: true,

    validate: (value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          return Array.isArray(JSON.parse(value));
        } catch {
          return false;
        }
      }
      return false;
    },

    errorMessage: 'Value must be an array',
  },

  [Operator.INCLUDES]: {
    supportsNot: true,

    validate: (value) => Array.isArray(value) || typeof value === 'string',

    errorMessage: 'Value must be an array or string',
  },

  [Operator.GT]: {
    supportsNot: true,
  },

  [Operator.LT]: {
    supportsNot: true,
  },

  [Operator.GTE]: {
    supportsNot: true,
  },

  [Operator.LTE]: {
    supportsNot: true,
  },

  [Operator.CONTAINS]: {
    supportsNot: true,
  },

  [Operator.STARTS_WITH]: {
    supportsNot: true,
  },

  [Operator.ENDS_WITH]: {
    supportsNot: true,
  },
};
