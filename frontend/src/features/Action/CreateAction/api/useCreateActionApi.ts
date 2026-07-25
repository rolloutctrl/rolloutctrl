import { apiClient } from '@/shared/api/apiClient';
import type { CreateActionBody } from '../model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getActionsByProjectIdQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';

const createAction = async (body: CreateActionBody) => {
  const response = await apiClient.post('/actions', body);
  return response.data;
};

export const useCreateActionApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: createAction,
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [getActionsByProjectIdQueryKey, { projectId }],
        });
      }
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Action created',
        message: 'Action has been created successfully',
        color: 'rollout'
      });
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
