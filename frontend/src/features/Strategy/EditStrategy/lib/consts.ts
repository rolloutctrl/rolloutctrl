import * as yup from 'yup';

import { Operator } from '@/shared/types/enums';
import type { EditStrategyFormState } from '../model/types';

export const editStrategyFormDefaultState: EditStrategyFormState = {
  projectId: '',
  featureFlagEnvironmentIds: [],
  name: '',
  isDefault: false,
  rolloutPercentage: undefined,
  rolloutStickinessField: undefined,
  segmentIds: [],
  priority: undefined,
  rules: [],
};

export const editStrategyFormSchema = yup.object().shape({
  featureFlagEnvironmentIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one environment must be selected')
    .required('At least one environment must be selected'),
  name: yup.string().optional(),
  isDefault: yup.boolean().optional(),
  rolloutPercentage: yup
    .number()
    .min(0, 'Rollout percentage must be between 0 and 100')
    .max(100, 'Rollout percentage must be between 0 and 100')
    .optional(),
  rolloutStickinessField: yup.string().when('rolloutPercentage', {
    is: (val: number | undefined) => val != null,
    then: (schema) =>
      schema.required(
        'Stickiness field is required when rollout percentage is set',
      ),
    otherwise: (schema) => schema.optional(),
  }),
  segmentIds: yup.array().of(yup.string().required()).optional(),
  priority: yup.number().min(0, 'Priority must be 0 or greater').optional(),
  startsAt: yup
    .date()
    .nullable()
    .test(
      'startsAt-requires-timezone',
      'Timezone is required when a date is set',
      function (value) {
        if (value == null) return true;
        return this.parent.timezone != null && this.parent.timezone !== '';
      },
    )
    .optional(),
  endsAt: yup
    .date()
    .nullable()
    .when('startsAt', {
      is: (val: Date | null | undefined) => val != null,
      then: (schema) =>
        schema.min(yup.ref('startsAt'), 'End date must be after start date'),
    })
    .test(
      'endsAt-requires-timezone',
      'Timezone is required when a date is set',
      function (value) {
        if (value == null) return true;
        return this.parent.timezone != null && this.parent.timezone !== '';
      },
    )
    .optional(),
  timezone: yup.string().when(['startsAt', 'endsAt'], {
    is: (startsAt: Date | null | undefined, endsAt: Date | null | undefined) =>
      startsAt != null || endsAt != null,
    then: (schema) =>
      schema.required('Timezone is required when a date is set'),
    otherwise: (schema) => schema.optional(),
  }),
  rules: yup
    .array()
    .of(
      yup.object().shape({
        field: yup.string().required('Rule field is required'),
        operator: yup
          .string()
          .oneOf(Object.values(Operator) as string[], 'Invalid operator')
          .required('Operator is required'),
        value: yup
          .mixed<string | string[]>()
          .test(
            'value-required',
            'Rule value is required',
            (value) =>
              Array.isArray(value)
                ? value.length > 0
                : typeof value === 'string' && value.trim() !== '',
          )
          .required('Rule value is required'),
      }),
    )
    .optional(),
});
