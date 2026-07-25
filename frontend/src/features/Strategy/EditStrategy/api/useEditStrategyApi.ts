import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import type { EditStrategyFormState } from '../model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Strategy } from '@/entities/Strategy';
import {
  getFeatureFlagByIdQueryKey,
  getStrategyByIdQueryKey,
} from '@/shared/constants/consts';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { DateTime } from 'luxon';

const updateStrategy = async (
  data: EditStrategyFormState,
  strategyId?: string,
) => {
  const { startsAt, endsAt, timezone, featureFlagEnvironmentIds, ...restData } = data;

  const startsAtUtc =
    startsAt && timezone
      ? DateTime.fromFormat(startsAt, 'yyyy-MM-dd HH:mm:ss', { zone: timezone })
          .toUTC()
          .toISO()
      : undefined;

  const endsAtUtc =
    endsAt && timezone
      ? DateTime.fromFormat(endsAt, 'yyyy-MM-dd HH:mm:ss', { zone: timezone })
          .toUTC()
          .toISO()
      : undefined;
  const rules = restData.rules?.map((rule) => ({
    ...rule,
    value: Array.isArray(rule.value)
      ? JSON.stringify(rule.value)
      : rule.value,
  }));

  const body = {
    ...restData,
    rules,
    featureFlagEnvironmentIds: featureFlagEnvironmentIds,
    startsAt: startsAtUtc,
    endsAt: endsAtUtc,
    timezone: timezone || undefined,
  };
  const response = await apiClient.patch<Strategy>(
    apiRoutes.strategies.update(strategyId),
    body,
  );
  return response.data;
};

export const useEditStrategyApi = (
  strategyId?: string,
  projectId?: string,
  flagId?: string,
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditStrategyFormState) =>
      updateStrategy(data, strategyId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey, { strategyId }],
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Strategy updated',
        message: 'Strategy has been updated successfully',
        color: 'rollout'
      });
      const envParam = data?.featureFlagEnvironmentId
        ? `?env=${data.featureFlagEnvironmentId}`
        : '';
      navigate(`/project/${projectId}/feature-flags/${flagId}${envParam}`);
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
