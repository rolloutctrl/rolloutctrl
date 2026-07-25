import { apiClient } from "@/shared/api/apiClient"
import { apiRoutes } from "@/shared/api/apiRoutes"
import { getFlagVariantsMetricsByIdQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";

const fetchFlagVariantsMetricsByFlagId = async (flagId: string, projectId?: string, environmentId?: string) => {
  const response = await apiClient.get(apiRoutes.metrics.flagVariants(flagId, projectId, environmentId));
  return response.data;
}

export const useGetFlagVariantsMetrics = (flagId: string, projectId?: string, environmentId?: string) => useQuery({
  queryKey: [getFlagVariantsMetricsByIdQueryKey, { flagId, projectId, environmentId }],
  queryFn: () => fetchFlagVariantsMetricsByFlagId(flagId, projectId, environmentId),
  enabled: !!flagId,
})