import { useAuthContext } from '@/app/providers/AuthProvider';
import { useGetCurrentUser } from '@/entities/User';
import type { EditUserBody, EditUserFormState } from '../model/types';
import { useMemo } from 'react';
import { editUserFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useEditUserApi } from '../api/useEditUserApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useEditUserForm = () => {
  const { isAuthenticated } = useAuthContext();
  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUser(isAuthenticated);

  const { mutateAsync, isPending } = useEditUserApi();

  const initialValues: EditUserFormState = useMemo(() => {
    if (currentUser) {
      const { name, email, bio } = currentUser;
      return {
        name,
        email,
        bio,
      };
    }
    return editUserFormDefaultState;
  }, [currentUser]);

  const submitForm: FormikConfig<EditUserFormState>['onSubmit'] =
    async (values) => {
      try {
        const body: EditUserBody = {
          name: values.name,
          bio: values.bio,
        };
        await mutateAsync(body);
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

  const isLoading = isLoadingUser || isPending;
  return {
    initialValues,
    isLoading,
    submitForm,
  };
};
