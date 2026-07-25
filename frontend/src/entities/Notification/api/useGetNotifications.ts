import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useInfiniteQuery } from '@tanstack/react-query';
import { type NotificationsResponse } from '../model/types';
import { getNotificationsQueryKey } from '@/shared/constants/consts';
import type { NotificationStatus } from '@/shared/types/enums';



type NotificationsParams = {
  status?: NotificationStatus;
  limit?: number;
  cursor?: string;
};

const fetchNotifications = async ({
  status,
  limit,
  cursor,
}: NotificationsParams) => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (status) params.append('status', status);
  if (limit) params.append('limit', String(limit));
  const response = await apiClient.get<NotificationsResponse>(
    apiRoutes.notifications.list,
    {
      params,
    },
  );
  return response.data;
};

export const useGetNotifications = ({
  status,
  limit = 10,
}: NotificationsParams = {}) => {
  return useInfiniteQuery({
    queryKey: [getNotificationsQueryKey, { status, limit }],
    queryFn: ({ pageParam }) =>
      fetchNotifications({
        status,
        limit,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
};
