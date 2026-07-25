import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getEnvironmentsByProjectIdQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { EnvironmentWithCounts } from '../model/types';

const fetchEnvironments = async (projectId?: string) => {
  const response = await apiClient.get<EnvironmentWithCounts[]>(apiRoutes.environments.list(projectId));
  return response.data;
};

export const useGetEnvironmentsByProjectId = (projectId?: string) =>
  useQuery({
    queryKey: [getEnvironmentsByProjectIdQueryKey, { projectId }],
    queryFn: () => fetchEnvironments(projectId),
    enabled: !!projectId,
  });
