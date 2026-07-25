import * as yup from 'yup';

import type { EditEnvironmentFormState } from '../model/types';

export const editEnvironmentFormDefaultState: EditEnvironmentFormState = {
  name: '',
  projectId: '',
  environmentId: '',
} as const;

export const editEnvironmentFormSchema = yup.object().shape({
  projectId: yup.string().required('Project ID is required'),
  environmentId: yup.string().required('Environment ID is required'),
  name: yup
    .string()
    .required('Environment name is required')
    .min(3, 'Environment name must contain at least 3 characters')
    .max(30, 'Environment name must not exceed 30 characters'),
});
