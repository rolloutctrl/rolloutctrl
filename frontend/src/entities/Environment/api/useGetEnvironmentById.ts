import { apiClient } from '@/shared/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import type { EnvironmentWithCounts } from '../model/types';
import { getEnvironmentByIdQueryKey } from '@/shared/constants/consts';
import { apiRoutes } from '@/shared/api/apiRoutes';

const fetchEnvironmentById = async (
  projectId?: string,
  environmentId?: string,
) => {
  const response = await apiClient.get<EnvironmentWithCounts>(
    apiRoutes.environments.environment(environmentId, projectId),
  );
  return response.data;
};

export const useGetEnvironmentById = (projectId?: string, environmentId?: string) =>
  useQuery({
    queryKey: [
      getEnvironmentByIdQueryKey,
      { projectId, environmentId },
    ],
    queryFn: () => fetchEnvironmentById(projectId, environmentId),
    enabled: !!projectId && !!environmentId,
  });
