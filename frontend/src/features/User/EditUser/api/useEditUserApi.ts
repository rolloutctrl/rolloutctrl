import { apiClient } from '@/shared/api/apiClient';
import type { EditUserBody } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';

const updateUserProfile = async (data: EditUserBody) => {
  const response = await apiClient.patch(
    apiRoutes.users.update,
    data,
  );
  return response.data;
};

export const useEditUserApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: (data: EditUserBody) => updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getCurrentUserQueryKey] });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Updated',
        message: 'Your profile has been updated successfully',
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
