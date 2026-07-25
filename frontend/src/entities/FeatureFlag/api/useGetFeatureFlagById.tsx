import { apiClient } from '@/shared/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import type { FeatureFlag } from '../model/types';
import { getFeatureFlagByIdQueryKey } from '@/shared/constants/consts';

const fetchFeatureFlagById = async (projectId?: string, flagId?: string) => {
  const response = await apiClient.get<FeatureFlag>(
    `/feature-flags/${flagId}`,
    {
      params: {
        projectId,
      },
    },
  );
  return response.data;
};

export const useGetFeatureFlagById = (projectId?: string, flagId?: string) =>
  useQuery({
    queryKey: [
      getFeatureFlagByIdQueryKey,
      { projectId, featureFlagKey: flagId },
    ],
    queryFn: () => fetchFeatureFlagById(projectId, flagId),
    enabled: !!projectId && !!flagId,
  });
