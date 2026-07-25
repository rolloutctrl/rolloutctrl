import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import {
  type Notification,
  type NotificationsResponse,
} from '@/entities/Notification';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { NotificationStatus } from '@/shared/types/enums';
import { getNotificationsQueryKey } from '@/shared/constants/consts';

const markAsReadNotification = async (notificationId?: string) => {
  const response = await apiClient.patch<Notification>(
    apiRoutes.notifications.markAsRead(notificationId),
  );
  return response.data;
};

export const useMarkAsReadNotificationApi = ({
  status,
  limit,
}: {
  status?: NotificationStatus;
  limit?: number;
}) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isSuccess, isError } = useMutation({
    mutationFn: (notificationId?: string) =>
      markAsReadNotification(notificationId),
    onSuccess: async (data: Notification) => {
      if (data.status === NotificationStatus.READ) {
        const queryKey = [getNotificationsQueryKey, { status, limit }];

        const existingData = queryClient.getQueryData<
          InfiniteData<NotificationsResponse, string>
        >([]);

        if (!existingData) {
          return queryClient.invalidateQueries({
            queryKey: [getNotificationsQueryKey],
            type: 'all',
          });
        }

        const updatedPages = existingData.pages.map((page) => ({
          ...page,
          notifications: page.notifications.map((notification) =>
            notification.id === data.id
              ? {
                  ...notification,
                  status: NotificationStatus.READ,
                }
              : notification,
          ),
        }));

        queryClient.setQueryData(queryKey, {
          ...existingData,
          pages: updatedPages,
        });
      }
    },
  });
  return { mutateAsync, isPending, isSuccess, isError };
};
