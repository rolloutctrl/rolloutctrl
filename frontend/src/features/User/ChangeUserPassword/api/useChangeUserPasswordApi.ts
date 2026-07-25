import { apiClient } from '@/shared/api/apiClient';
import type { ChangeUserPasswordBody } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

const changeUserPassword = async (data: ChangeUserPasswordBody) => {
  const response = await apiClient.patch(
    apiRoutes.users.changePassword,
    data,
  );
  return response.data;
};

export const useChangeUserPasswordApi = () => {
  const { mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: (data: ChangeUserPasswordBody) => changeUserPassword(data),
    onSuccess: () => {
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Updated',
        message: 'Your password has been changed successfully',
        color: 'rollout'
      });
    },
  });
  return {
    mutateAsync,
    isPending,
    isSuccess,
    isError,
  };
};
