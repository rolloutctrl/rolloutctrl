import { apiClient } from '@/shared/api/apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { FeatureFlag } from '../model/types';
import { getFeatureFlagsByProjectIdQueryKey } from '@/shared/constants/consts';

type FeatureFlagsResponse = {
  data: FeatureFlag[];
  nextCursor: string | null;
  hasMore: boolean;
};

const fetchFeatureFlagsByProjectId = async (
  projectId?: string,
  cursor?: string,
  includeArchived?: boolean,
  limit: number = 10,
): Promise<FeatureFlagsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (includeArchived) params.append('includeArchived', 'true');
  params.append('limit', String(limit));

  const response = await apiClient.get<FeatureFlagsResponse>(
    `/feature-flags/project/${projectId}?${params.toString()}`,
  );
  return response.data;
};

export const useGetFeatureFlagsByProjectId = (
  projectId?: string,
  includeArchived?: boolean,
) =>
  useInfiniteQuery({
    queryKey: [
      getFeatureFlagsByProjectIdQueryKey,
      { projectId, includeArchived },
    ],
    queryFn: ({ pageParam }) =>
      fetchFeatureFlagsByProjectId(
        projectId,
        pageParam as string | undefined,
        includeArchived,
        10,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!projectId,
  });
