import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CreateEnvironmentFormState } from '../model/types';
import { createEnvironmentFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useCreateEnvironmentApi } from '../api/useCreateEnvironmentApi';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useCreateEnvironmentForm = (onClose: () => void) => {
  const { projectId } = useParams();

  const [initialValues] = useState<CreateEnvironmentFormState>(() => ({
    ...createEnvironmentFormDefaultState,
    projectId: projectId || '',
  }));

  const { mutateAsync, isPending } = useCreateEnvironmentApi();

  const submitForm: FormikConfig<CreateEnvironmentFormState>['onSubmit'] =
    async (values) => {
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
