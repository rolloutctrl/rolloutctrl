import {
  useGetNotifications,
  NotificationCardRenderer,
} from '@/entities/Notification';
import { useNotificationActions } from '@/features/Notification/Actions';
import { Center, Loader, Stack, Text, ScrollArea } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import type { NotificationStatus } from '@/shared/types/enums';

type NotificationsListProps = {
  status?: NotificationStatus;
  limit?: number;
  onClose: () => void;
};

export const NotificationsList = ({
  status,
  limit,
  onClose,
}: NotificationsListProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetNotifications({ status, limit });

  const { handleMarkAsRead } = useNotificationActions({ status, limit });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data],
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= documentHeight - 200) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py="xl">
        <Text c="red" size="sm">
          Failed to load notifications
        </Text>
      </Center>
    );
  }

  if (notifications.length === 0) {
    return (
      <Center py="xl">
        <Text size="sm" c="dimmed">
          No notifications
        </Text>
      </Center>
    );
  }

  return (
    <ScrollArea offsetScrollbars className="h-[calc(100vh-76px)]">
      <Stack gap="xs">
        {notifications.map((notification) => (
          <NotificationCardRenderer
            key={notification.id}
            notification={notification}
            actions={{ handleMarkAsRead }}
            onClose={onClose}
          />
        ))}

        {isFetchingNextPage && (
          <Center p="md">
            <Loader size="sm" />
          </Center>
        )}
      </Stack>
    </ScrollArea>
  );
};
