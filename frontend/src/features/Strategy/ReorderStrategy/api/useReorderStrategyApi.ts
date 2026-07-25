import { apiClient } from '@/shared/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Strategy } from '@/entities/Strategy';
import { getFeatureFlagByIdQueryKey } from '@/shared/constants/consts';

type ReorderStrategyItem = {
  id: string;
};

type ReorderStrategiesParams = {
  featureFlagEnvironmentId: string;
  rules: ReorderStrategyItem[];
  projectId?: string;
  flagId?: string;
};

const reorderStrategies = async (
  data: ReorderStrategiesParams,
): Promise<Strategy[]> => {
  const response = await apiClient.patch<Strategy[]>(
    `/strategies/environment/${data.featureFlagEnvironmentId}/reorder`,
    { rules: data.rules, projectId: data.projectId },
  );
  return response.data;
};

export const useReorderStrategyApi = (projectId?: string, flagId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: ReorderStrategiesParams) => reorderStrategies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
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
