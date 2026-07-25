import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  getFeatureFlagByIdQueryKey,
  getStrategyByIdQueryKey,
} from '@/shared/constants/consts';
import type { FeatureFlag } from '@/entities/FeatureFlag';

type ToggleStrategyEnableParams = {
  projectId?: string;
  strategyId: string;
  enabled: boolean;
};

const toggleStrategyEnable = async (params: ToggleStrategyEnableParams) => {
  const response = await apiClient.post(
    `${apiRoutes.strategies.strategy(params.strategyId)}/toggle-enable`,
    { enabled: params.enabled, projectId: params.projectId },
  );
  return { strategyId: params.strategyId, enabled: params.enabled, ...response.data };
};

export const useToggleStrategyEnableApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: ToggleStrategyEnableParams) =>
      toggleStrategyEnable(params),
    onSuccess: (data) => {
      const { strategyId, enabled } = data;

      queryClient.setQueriesData<FeatureFlag>(
        { queryKey: [getFeatureFlagByIdQueryKey] },
        (existingFlag) => {
          if (!existingFlag) return existingFlag;
          const updatedEnv = existingFlag.environments.map((env) => ({
              ...env,
              strategies: env.strategies.map((s) =>
                s.id === strategyId ? { ...s, enabled } : s,
              ),
            }))

          return {
            ...existingFlag,
            environments: updatedEnv,
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: [getFeatureFlagByIdQueryKey],
        type: 'active',
      });

      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey],
        type: 'active',
      });

      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: enabled ? 'Strategy enabled' : 'Strategy disabled',
        message: enabled
          ? 'The strategy has been enabled successfully'
          : 'The strategy has been disabled successfully',
        color: enabled ? 'cyan' : 'red',
      });
    },
  });

  return { mutateAsync, isPending, isError, isSuccess };
};
