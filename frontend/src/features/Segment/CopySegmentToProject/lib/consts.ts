import * as yup from 'yup';

import type { CopySegmentToProjectFormState } from "../model/types";

export const copySegmentToProjectFormDefaultState: CopySegmentToProjectFormState = {
  projectId: "",
  segmentId: "",
} as const;

export const copySegmentToProjectFormSchema = yup.object().shape({
  projectId: yup.string().required('Project is required'),
  segmentId: yup.string().required('Segment is required'),
});

