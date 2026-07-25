import { useState } from 'react';
import { loginFormDefaultState } from './consts';
import type { LoginFormState } from '../model/types';
import { type FormikConfig } from 'formik';
import { useLoginFormApi } from '../api/useLoginFormApi';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useLoginForm = () => {
  const [initialValues] = useState<LoginFormState>(() => loginFormDefaultState);

  const { mutateAsync, isPending } = useLoginFormApi();

  const submitForm: FormikConfig<LoginFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await mutateAsync(values);
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
