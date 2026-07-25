import { apiClient } from "@/shared/api/apiClient";
import { apiRoutes } from "@/shared/api/apiRoutes";
import type { Segment } from "../model/types";
import { getSegmentsByProjectIdQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";

const fetchSegmentsByProjectId = async (projectId: string) => {
  const response = await apiClient.get<Segment[]>(apiRoutes.segments.list(projectId));
  return response.data;
};

export const useGetSegmentsByProjectId = (projectId?: string) => useQuery({
  queryKey: [getSegmentsByProjectIdQueryKey, projectId],
  queryFn: () => {
    if (!projectId) throw new Error('projectId is required');
    return fetchSegmentsByProjectId(projectId);
  },
  enabled: !!projectId,
});