import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import type { Variant } from '../model/types';
import { useQuery } from '@tanstack/react-query';
import { getVariantsByFlagIdQueryKey } from '@/shared/constants/consts';

const fetchVariantsByFlagId = async (flagId: string, projectId?: string, environmentId?: string) => {
  const queryParams = new URLSearchParams();
  
  if (projectId) queryParams.append('projectId', projectId);
  if (environmentId) queryParams.append('environmentId', environmentId);

  const response = await apiClient.get<Variant[]>(
    apiRoutes.variants.list(flagId),
    { params: queryParams },
  );
  return response.data;
};

export const useGetVariantsByFlagId = (flagId?: string, projectId?: string, environmentId?: string) =>
  useQuery({
    queryKey: [getVariantsByFlagIdQueryKey, { flagId, projectId, environmentId }],
    queryFn: () => {
      if (!flagId) throw new Error('flagId is required');
      return fetchVariantsByFlagId(flagId, projectId, environmentId);
    },
    enabled: !!flagId && !!projectId,
  });
