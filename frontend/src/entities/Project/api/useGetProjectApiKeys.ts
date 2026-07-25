import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectApiKeysQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { ApiKeyBasic } from '../model/types';

const fetchProjectApiKeys = async (projectId?: string) => {
  const response = await apiClient.get<ApiKeyBasic[]>(apiRoutes.projects.apiKeys(projectId));
  return response.data;
};

export const useGetProjectApiKeys = (projectId?: string) =>
  useQuery({
    queryKey: [getProjectApiKeysQueryKey, { projectId }],
    queryFn: () => fetchProjectApiKeys(projectId),
    enabled: !!projectId,
  });
