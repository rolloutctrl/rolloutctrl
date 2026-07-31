import * as yup from 'yup';

import { Operator } from '@/shared/types/enums';
import type { CreateStrategyFormState } from '../model/types';

export type StrategyPreset = 'default' | 'standard' | 'gradual' | 'scheduled';

export const createStrategyFormDefaultState: CreateStrategyFormState = {
  projectId: '',
  featureFlagEnvironmentIds: [],
  name: '',
  rolloutPercentage: undefined,
  rolloutStickinessField: undefined,
  segmentIds: [],
  priority: undefined,
  rules: [],
  variants: [],
};

export const STRATEGY_PRESET_DEFAULTS: Record<
  StrategyPreset,
  Pick<CreateStrategyFormState, 'rolloutPercentage' | 'rolloutStickinessField'>
> = {
  default: {
    rolloutPercentage: undefined,
    rolloutStickinessField: undefined,
  },
  standard: {
    rolloutPercentage: undefined,
    rolloutStickinessField: undefined,
  },
  gradual: {
    rolloutPercentage: 25,
    rolloutStickinessField: 'key',
  },
  scheduled: {
    rolloutPercentage: 100,
    rolloutStickinessField: 'key',
  },
};

export const strategyPresetOptions = [
  { value: 'default', label: 'Default' },
  { value: 'standard', label: 'Standard' },
  { value: 'gradual', label: 'Gradual Rollout' },
  { value: 'scheduled', label: 'Scheduled Rollout' },
];

export const strategyPresetLabels: Record<StrategyPreset, string> = {
  default: 'Default',
  standard: 'Standard',
  gradual: 'Gradual Rollout',
  scheduled: 'Scheduled Rollout',
};

export const strategyPresetDescriptions: Record<StrategyPreset, string> = {
  default:
    'Passes 100% of all users. No segments, rollout percentage, or targeting rules can be specified. Only variants can be assigned.',
  standard:
    'Applies the strategy to all matching users without a rollout percentage. Segments and targeting rules can be used to narrow the audience.',
  gradual:
    'Gradually rolls out the strategy to a percentage of users. A stickiness field ensures consistent assignment for each user.',
  scheduled:
    'Rolls out the strategy to a percentage of users with a configurable start and end date. Useful for time-bound feature releases.',
};


export const createStrategyFormSchema = yup.object().shape({
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
        schema.min(
          yup.ref('startsAt'),
          'End date must be after start date',
        ),
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
    is: (
      startsAt: Date | null | undefined,
      endsAt: Date | null | undefined,
    ) => startsAt != null || endsAt != null,
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
          .oneOf(
            Object.values(Operator) as string[],
            'Invalid operator',
          )
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

