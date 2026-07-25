import * as yup from 'yup';

import type { EditSegmentFormState } from '../model/types';
import { Operator } from '@/shared/types/enums';

export const editSegmentFormDefaultState: EditSegmentFormState = {
  id: '',
  projectId: '',
  key: '',
  name: '',
  description: '',
  rules: [],
};

export const editSegmentFormSchema = yup.object().shape({
  id: yup.string().required('Segment ID is required'),
  projectId: yup.string().required('Project is required'),
  key: yup
    .string()
    .required('Segment key is required')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Key may only contain letters, numbers, hyphens and underscores',
    ),
  name: yup.string().required('Segment name is required'),
  description: yup.string().optional(),
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
        priority: yup.number().min(0, 'Priority must be 0 or greater').optional(),
        not: yup.boolean().optional(),
      }),
    )
    .optional(),
});

