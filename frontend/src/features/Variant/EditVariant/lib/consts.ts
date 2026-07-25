import * as yup from 'yup';
import { VariantPayloadType } from '@/shared/types/enums';
import type { EditVariantFormState } from '../model/types';

export const editVariantFormDefaultState: EditVariantFormState = {
  name: '',
  description: '',
  payload: '',
  payloadType: VariantPayloadType.STRING,
  colorTag: '',
  projectId: '',
};

export const editVariantFormSchema = yup.object().shape({
  name: yup.string().required('Variant name is required'),
  description: yup.string().optional(),
  payloadType: yup
    .string()
    .oneOf(Object.values(VariantPayloadType), 'Invalid payload type')
    .required('Payload type is required'),
  payload: yup.string().optional(),
  colorTag: yup.string().required('Color is required'),
  projectId: yup.string().required('Project is required'),
});
