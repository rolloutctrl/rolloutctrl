import { apiClient } from "@/shared/api/apiClient"
import { apiRoutes } from "@/shared/api/apiRoutes"
import { getFlagStrategyMetricsByIdQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";

const fetchFlagStrategyMetricsByFlagId = async (flagId: string, projectId?: string, environmentId?: string) => {
  const response = await apiClient.get(apiRoutes.metrics.flagStrategy(flagId, projectId, environmentId));
  return response.data;
}

export const useGetFlagStrategyMetrics = (flagId: string, projectId?: string, environmentId?: string) => useQuery({
  queryKey: [getFlagStrategyMetricsByIdQueryKey, { flagId, projectId, environmentId }],
  queryFn: () => fetchFlagStrategyMetricsByFlagId(flagId, projectId, environmentId),
  enabled: !!flagId,
})