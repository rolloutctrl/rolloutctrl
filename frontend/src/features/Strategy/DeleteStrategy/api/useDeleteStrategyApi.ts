import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import {
  getFeatureFlagByIdQueryKey,
  getProjectByIdQueryKey,
  getProjectsQueryKey,
  getVariantsByFlagIdQueryKey,
} from '@/shared/constants/consts';
import type { Nullable } from '@/shared/types/types';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteStrategy = async (
  strategyId: string,
  projectId?: Nullable<string>,
) => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  const response = await apiClient.delete(
    apiRoutes.strategies.delete(strategyId),
    {
      params,
    },
  );
  return response.data;
};

export const useDeleteStrategyApi = (projectId: string, flagId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (strategyId: string) => deleteStrategy(strategyId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: [getProjectByIdQueryKey, { projectId }],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: [getProjectsQueryKey],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: [getVariantsByFlagIdQueryKey],
        type: 'all',
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Strategy deleted',
        message: 'Strategy has been deleted successfully',
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
