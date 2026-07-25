import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import type { Strategy } from '../model/types';
import { useQuery } from '@tanstack/react-query';
import { getStrategyByIdQueryKey } from '@/shared/constants/consts';

const fetchStrategyById = async (strategyId: string) => {
  const response = await apiClient.get<Strategy>(
    apiRoutes.strategies.strategy(strategyId),
  );
  return response.data;
};

export const useGetStrategyById = (strategyId?: string) =>
  useQuery({
    queryKey: [getStrategyByIdQueryKey, { strategyId }],
    queryFn: () => {
      if (!strategyId) throw new Error('strategyId is required');
      return fetchStrategyById(strategyId);
    },
    enabled: !!strategyId,
  });
