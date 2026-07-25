import * as yup from 'yup';

import type { EditProjectFormState } from '../model/types';

export const editProjectFormDefaultState: EditProjectFormState = {
  projectId: '',
  name: '',
  slug: '',
  description: '',
} as const;

export const editProjectFormSchema = yup.object().shape({
  projectId: yup.string().required('ProjectId is required'),
  name: yup.string().required('Name is required'),
  slug: yup
    .string()
    .required('Slug is required')
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)+$/,
      'Slug must be in kebab-case (e.g., "my-key") or camelCase (e.g., "myKey") format, containing only lowercase letters, numbers, and hyphens for kebab-case, or camelCase with uppercase letters for word separation',
    )
    .min(3, 'Slug must contain at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters'),
  description: yup.string(),
});
