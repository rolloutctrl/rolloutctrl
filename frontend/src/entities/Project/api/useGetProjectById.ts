import { apiClient } from "@/shared/api/apiClient";
import { apiRoutes } from "@/shared/api/apiRoutes";
import { getProjectByIdQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";
import type { ProjectWithCounts } from "../model/types";

const fetchProjectById = async (id?: string) => {
  const response = await apiClient.get<ProjectWithCounts>(apiRoutes.projects.project(id));
  return response.data;
};

export const useGetProjectById = (id?: string) => useQuery({
  queryKey: [getProjectByIdQueryKey, id],
  queryFn: () => fetchProjectById(id),
  enabled: !!id,
});