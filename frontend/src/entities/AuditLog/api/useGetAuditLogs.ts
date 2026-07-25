import { apiClient } from '@/shared/api/apiClient';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AuditLog } from '../model/types';
import { getAuditLogsQueryKey } from '@/shared/constants/consts';
import type { AuditAction, ResourceType } from '@/shared/types/enums';

type AuditLogsResponse = {
  data: AuditLog[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FetchAuditLogsParams = {
  projectId?: string;
  search?: string;
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
};

const fetchAuditLogs = async (
  params: FetchAuditLogsParams,
): Promise<AuditLogsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.projectId) queryParams.append('projectId', params.projectId);
  if (params.search) queryParams.append('search', params.search);
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.action) queryParams.append('action', params.action);
  if (params.resourceType) queryParams.append('resourceType', params.resourceType);
  if (params.resourceId) queryParams.append('resourceId', params.resourceId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.cursor) queryParams.append('cursor', params.cursor);
  if (params.limit) queryParams.append('limit', String(params.limit));

  const response = await apiClient.get<AuditLogsResponse>(
    `/audit-logs?${queryParams.toString()}`,
  );
  return response.data;
};

export const useGetAuditLogs = (params: FetchAuditLogsParams = {}) =>
  useInfiniteQuery({
    queryKey: [getAuditLogsQueryKey, params],
    queryFn: ({ pageParam }) =>
      fetchAuditLogs({
        ...params,
        cursor: pageParam as string | undefined,
        limit: params.limit || 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!params.projectId,
  });