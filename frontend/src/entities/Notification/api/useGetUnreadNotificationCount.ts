import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getUnreadNotificationCountQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';

const fetchUnreadCount = async () => {
  const respinse = await apiClient.get<{ count: number }>(
    apiRoutes.notifications.unreadCount,
  );
  return respinse.data;
};

export const useGetUnreadNotificationCount = () =>
  useQuery({
    queryKey: [getUnreadNotificationCountQueryKey],
    queryFn: fetchUnreadCount,
    refetchInterval: 10_000,
  });

