import * as yup from 'yup';

import type { CreateEnvironmentFormState } from '../model/types';

export const createEnvironmentFormDefaultState: CreateEnvironmentFormState = {
  name: '',
  projectId: '',
} as const;

export const createEnvironmentFormSchema = yup.object().shape({
  projectId: yup.string().required('Project ID is required'),
  name: yup
    .string()
    .required('Environment name is required')
    .min(3, 'Environment name must contain at least 3 characters')
    .max(30, 'Environment name must not exceed 30 characters'),
});
