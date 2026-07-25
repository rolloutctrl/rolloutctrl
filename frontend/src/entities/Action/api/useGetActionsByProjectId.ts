import { apiClient } from '@/shared/api/apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Action } from '../model/types';
import { getActionsByProjectIdQueryKey } from '@/shared/constants/consts';

type ActionsResponse = {
  data: Action[];
  nextCursor: string | null;
  hasMore: boolean;
};

const fetchActionsByProjectId = async (
  projectId: string,
  cursor?: string,
  limit: number = 10,
): Promise<ActionsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  params.append('limit', String(limit));

  const response = await apiClient.get<ActionsResponse>(
    `/actions/project/${projectId}?${params.toString()}`,
  );
  return response.data;
};

export const useGetActionsByProjectId = (projectId?: string) =>
  useInfiniteQuery({
    queryKey: [getActionsByProjectIdQueryKey, { projectId }],
    queryFn: ({ pageParam }) =>
      fetchActionsByProjectId(projectId!, pageParam as string | undefined, 10),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!projectId,
  });
