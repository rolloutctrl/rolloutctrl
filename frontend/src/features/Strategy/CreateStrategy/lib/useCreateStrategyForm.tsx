import { useState } from 'react';
import { createStrategyFormDefaultState } from './consts';
import type { CreateStrategyFormState } from '../model/types';
import type { FormikConfig } from 'formik';
import { useCreateStrategyApi } from '../api/useCreateStrategyApi';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useParams } from 'react-router-dom';

type UseCreateStrategyFormProps = {
  featureFlagEnvironmentId: string;
  onClose: () => void;
};

export const useCreateStrategyForm = ({
  featureFlagEnvironmentId,
  onClose,
}: UseCreateStrategyFormProps) => {
  const { projectId, featureFlagId } = useParams();
  const [initialValues] = useState<CreateStrategyFormState>(() => ({
    ...createStrategyFormDefaultState,
    featureFlagEnvironmentId,
  }));

  const { mutateAsync, isPending } = useCreateStrategyApi(projectId, featureFlagId);

  const { data: segments, isLoading: isSegmentsLoading } = useGetSegmentsByProjectId(projectId);

  const submitForm: FormikConfig<CreateStrategyFormState>['onSubmit'] = async (
    values,
  ) => {
    await mutateAsync(values);
    onClose();
  };

  const segmentOptions = (segments || [])?.map((segment) => ({
    value: segment.id,
    label: segment.name,
  }));

  return {
    initialValues,
    submitForm,
    isPending,
    segmentOptions,
    isSegmentsLoading,
  };
};
