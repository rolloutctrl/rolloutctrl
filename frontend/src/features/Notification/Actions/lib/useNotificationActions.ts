import { NotificationStatus } from "@/shared/types/enums";
import { useMarkAsReadNotificationApi } from "../api/useMarkAsReadNotificationApi";
import type { Notification } from "@/entities/Notification";
import { useDebouncedCallback } from "@mantine/hooks";

export const useNotificationActions = ({
  status,
  limit,
}: {
  status?: NotificationStatus;
  limit?: number;
}) => {
  const { mutateAsync: markAsRead, isPending: isPendingMarkAsRead } = useMarkAsReadNotificationApi({
    status,
    limit,
  });

  const handleMarkAsRead = useDebouncedCallback(async (notification?: Notification) => {
    if (!notification || notification?.status === NotificationStatus.READ) return;
    await markAsRead(notification.id);
  }, 300);

  return {
    handleMarkAsRead,
    isPendingMarkAsRead,
  };
};
