import type { ChangeUserPasswordBody, ChangeUserPasswordFormState } from '../model/types';
import { changeUserPasswordFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useChangeUserPasswordApi } from '../api/useChangeUserPasswordApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useChangeUserPasswordForm = () => {
  const { mutateAsync, isPending } = useChangeUserPasswordApi();

  const initialValues: ChangeUserPasswordFormState =
    changeUserPasswordFormDefaultState;

  const submitForm: FormikConfig<ChangeUserPasswordFormState>['onSubmit'] =
    async (values, { resetForm }) => {
      try {
        const body: ChangeUserPasswordBody = {
          password: values.password,
        };
        await mutateAsync(body);
        resetForm();
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

  const isLoading = isPending;
  return {
    initialValues,
    isLoading,
    submitForm,
  };
};
