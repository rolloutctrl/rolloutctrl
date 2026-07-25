import { apiClient } from "@/shared/api/apiClient";
import type { StrategyVariant } from "../model/types";
import { useQuery } from "@tanstack/react-query";
import { getStrategyVariantsQueryKey } from "@/shared/constants/consts";

const fetchStrategyVariants = async (strategyId: string) => {
  const response = await apiClient.get<StrategyVariant[]>(
    `/strategies/${strategyId}/variants`,
  );
  return response.data;
};

export const useGetStrategyVariants = (strategyId?: string) =>
  useQuery({
    queryKey: [getStrategyVariantsQueryKey, { strategyId }],
    queryFn: () => {
      if (!strategyId) throw new Error('strategyId is required');
      return fetchStrategyVariants(strategyId);
    },
    enabled: !!strategyId,
  });