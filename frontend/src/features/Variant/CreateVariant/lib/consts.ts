import * as yup from 'yup';
import { VariantPayloadType } from "@/shared/types/enums";
import type { CreateVariantFormState } from "../model/types";
import { variantColorsHex } from '@/shared/constants/consts';

export const createVariantFormDefaultState: CreateVariantFormState = {
  name: '',
  description: '',
  payload: '',
  payloadType: VariantPayloadType.STRING,
  colorTag: variantColorsHex[0],
  projectId: '',
  featureFlagId: '',
};

export const createVariantFormSchema = yup.object().shape({
  name: yup.string().required('Variant name is required'),
  description: yup.string().optional(),
  payloadType: yup
    .string()
    .oneOf(Object.values(VariantPayloadType), 'Invalid payload type')
    .required('Payload type is required'),
  payload: yup.string().optional(),
  colorTag: yup.string().required('Color is required'),
  projectId: yup.string().required('Project is required'),
  featureFlagId: yup.string().required('Feature flag is required'),
});