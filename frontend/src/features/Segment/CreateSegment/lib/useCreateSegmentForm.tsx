import { useState } from 'react';
import type { CreateSegmentFormState } from '../model/types';
import type { FormikConfig } from 'formik';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useParams } from 'react-router-dom';
import { useCreateSegmentApi } from '../api/useCreateSegmentApi';
import { createSegmentFormDefaultState } from './consts';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useCreateSegmentForm = (onClose: () => void) => {
  const { projectId } = useParams();
  const [initialValues] = useState<CreateSegmentFormState>(() => ({
    ...createSegmentFormDefaultState,
    projectId: projectId || '',
  }));

  const { mutateAsync, isPending } = useCreateSegmentApi(projectId);

  const { data: segments, isLoading: isSegmentsLoading } =
    useGetSegmentsByProjectId(projectId);

  const submitForm: FormikConfig<CreateSegmentFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await mutateAsync(values);
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    }
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
