import * as yup from 'yup';

import type { CollectContextsFormState } from '../model/types';

export const collectContextsFormDefaultState: CollectContextsFormState = {
  isEnabled: false,
  allowedAttributes: [],
} as const;

export const collectContextsFormSchema = yup.object().shape({
  isEnabled: yup.boolean().required(),
  allowedAttributes: yup
    .array()
    .of(
      yup
        .string()
        .max(120, 'Each allowed attribute must be at most 120 characters')
        .matches(
          /^[a-zA-Z0-9_]+$/,
          'Each allowed attribute must contain only letters, numbers and underscores',
        ),
    )
    .when('isEnabled', {
      is: true,
      then: (schema) =>
        schema.min(1, 'Allowed attributes cannot be empty when enabled'),
      otherwise: (schema) => schema,
    }),
});
