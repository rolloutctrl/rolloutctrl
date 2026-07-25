import { apiClient } from '@/shared/api/apiClient';
import type { CollectContextsFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectByIdQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';

const saveCollectContextsSettings = async (
  data: CollectContextsFormState,
  projectId?: string,
) => {
  const response = await apiClient.post(
    apiRoutes.projects.collectContexts(projectId),
    data,
  );
  return response.data;
};

export const useCollectContextsApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (data: CollectContextsFormState) =>
      saveCollectContextsSettings(data, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getProjectByIdQueryKey, { projectId }],
        type: 'active',
      });

      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Updated',
        message: 'The collect contexts settings have been saved successfully',
        color: 'rollout'
      });
    },
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
