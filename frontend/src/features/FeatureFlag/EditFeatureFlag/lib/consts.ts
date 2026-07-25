import * as yup from 'yup';

import type { EditFeatureFlagFormState } from '../model/types';

export const editFeatureFlagFormDefaultState: EditFeatureFlagFormState = {
  flagId: '',
  projectId: '',
  key: '',
  description: '',
  archived: false,
} as const;

export const editFeatureFlagFormSchema = yup.object().shape({
  flagId: yup.string().required('Flag ID is required'),
  projectId: yup.string().required('Project ID is required'),
  description: yup.string(),
  key: yup
    .string()
    .required('Key is required')
    .matches(
      /^[a-z-]+$/,
      'Key can only contain lowercase Latin letters (a-z) and hyphens (-). Numbers and dots are not allowed',
    )
    .min(3, 'Key must contain at least 3 characters')
    .max(100, 'Key must not exceed 100 characters'),
});
