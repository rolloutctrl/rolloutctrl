import * as yup from 'yup';

import type { CreateFeatureFlagFormState } from "../model/types";

export const createFeatureFlagFormDefaultState: CreateFeatureFlagFormState = {
  projectId: "",
  key: "",
  description: "",
  flags: "",
  type: "single",
} as const;

export const createFeatureFlagFormSchema = yup.object().shape({
  projectId: yup.string().required('Project ID is required'),
  description: yup.string(),
  type: yup.string().required(),
  key: yup.string().when('type', {
    is: 'single',
    then: (schema) =>
      schema
        .required('Key is required')
        .matches(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)+$/,
          'Key can only contain lowercase Latin letters (a-z) and hyphens (-). Numbers and dots are not allowed',
        )
        .min(3, 'Key must contain at least 3 characters')
        .max(100, 'Key must not exceed 100 characters'),
    otherwise: (schema) => schema.notRequired(),
  }),
  flags: yup.string().when('type', {
    is: 'multiple',
    then: (schema) => schema.required('Flags are required for multiple type'),
    otherwise: (schema) => schema.notRequired(),
  }),
});