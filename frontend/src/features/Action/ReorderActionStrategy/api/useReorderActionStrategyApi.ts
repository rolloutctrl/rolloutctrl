import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Action } from '@/entities/Action';
import {
  getActionByIdQueryKey,
  getActionsByProjectIdQueryKey,
} from '@/shared/constants/consts';

type ReorderActionStrategyItem = {
  id: string;
};

type ReorderActionStrategiesParams = {
  actionId: string;
  rules: ReorderActionStrategyItem[];
  projectId?: string;
};

const reorderActionStrategies = async (
  data: ReorderActionStrategiesParams,
): Promise<Action> => {
  const response = await apiClient.patch<Action>(
    apiRoutes.actions.reorder(data.actionId),
    { rules: data.rules },
  );
  return response.data;
};

export const useReorderActionStrategyApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: ReorderActionStrategiesParams) =>
      reorderActionStrategies(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          getActionByIdQueryKey,
          { actionId: variables.actionId, projectId },
        ],
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [getActionsByProjectIdQueryKey, { projectId }],
        });
      }
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
