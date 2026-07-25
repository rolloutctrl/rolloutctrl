import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { createVariantFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import type { CreateVariantFormState } from '../model/types';
import { useCreateVariantApi } from '../api/useCreateVariantApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useCreateVariantForm = (onClose: () => void) => {
  const { projectId, featureFlagId } = useParams();

  const { mutateAsync, isPending } = useCreateVariantApi(
    projectId,
    featureFlagId,
  );

  const initialValues: CreateVariantFormState = useMemo(() => {
    return {
      ...createVariantFormDefaultState,
      projectId: projectId ?? '',
      featureFlagId: featureFlagId ?? '',
    };
  }, [projectId, featureFlagId]);

  const submitForm: FormikConfig<CreateVariantFormState>['onSubmit'] = async (
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

  return {
    initialValues,
    submitForm,
    isPending,
  };
};
