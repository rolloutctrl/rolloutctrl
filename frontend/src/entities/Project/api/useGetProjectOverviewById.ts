import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectOverviewByIdQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { ProjectOverview } from '../model/types';

const fetchProjectOverviewById = async (projectId: string) => {
  const response = await apiClient.get<ProjectOverview>(apiRoutes.projects.overview(projectId));
  return response.data;
};

export const useGetProjectOverviewById = (projectId: string) =>
  useQuery({
    queryKey: [getProjectOverviewByIdQueryKey, { projectId }],
    queryFn: () => fetchProjectOverviewById(projectId),
    enabled: !!projectId,
  });
