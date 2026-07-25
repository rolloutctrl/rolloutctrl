import { apiClient } from '@/shared/api/apiClient';
import type { CreateStrategyFormState } from '../model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Strategy } from '@/entities/Strategy';
import { getFeatureFlagByIdQueryKey } from '@/shared/constants/consts';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { DateTime } from 'luxon';
import { buildCreatePayload, type AssignVariantItem } from '@/features/Strategy/AssignStrategyVariant';


const createStrategyVariants = async (strategies: Strategy[], variants: AssignVariantItem[]) => {
  if (variants && variants.length > 0) {
    const payload = { variants: variants.map(buildCreatePayload) };
    await Promise.all(
      strategies.map((strategy) =>
        apiClient.post(`/strategies/${strategy.id}/variants/batch`, payload),
      ),
    );
  }
};

const createStrategy = async (data: CreateStrategyFormState) => {
  const { startsAt, endsAt, timezone, variants, ...restData } = data;
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
    startsAt: startsAtUtc,
    endsAt: endsAtUtc,
    timezone: timezone || undefined,
  };
  const response = await apiClient.post<Strategy[]>('/strategies', body);
  const strategies = response.data;

  await createStrategyVariants(strategies, variants ?? []);

  return strategies;
};

export const useCreateStrategyApi = (
  projectId?: string,
  flagId?: string,
  needRedirect?: boolean,
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateStrategyFormState) => createStrategy(data),
    onSuccess: (data) => {
      // Invalidate feature flag queries to refresh strategies
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Strategy created',
        message: 'Strategy has been created successfully',
        color: 'rollout'
      });
      if (needRedirect) {
        const envParam = data?.[0]?.featureFlagEnvironmentId
          ? `?env=${data[0].featureFlagEnvironmentId}`
          : '';
        navigate(`/project/${projectId}/feature-flags/${flagId}${envParam}`);
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
