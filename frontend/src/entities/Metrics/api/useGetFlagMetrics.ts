import { apiClient } from "@/shared/api/apiClient"
import { apiRoutes } from "@/shared/api/apiRoutes"
import { getFlagMetricsByIdQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";
import type { MetricsFlag } from "../model/types";

const fetchFlagMetricsByFlagId = async (flagId: string, projectId?: string, environmentId?: string) => {
  const response = await apiClient.get<MetricsFlag>(apiRoutes.metrics.flag(flagId, projectId, environmentId));
  return response.data;
}

export const useGetFlagMetrics = (flagId: string, projectId?: string, environmentId?: string) => useQuery({
  queryKey: [getFlagMetricsByIdQueryKey, { flagId, projectId, environmentId }],
  queryFn: () => fetchFlagMetricsByFlagId(flagId, projectId, environmentId),
  enabled: !!flagId,
})