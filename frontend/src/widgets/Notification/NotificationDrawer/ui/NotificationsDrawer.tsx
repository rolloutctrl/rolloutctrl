import {
  ActionIcon as MantineActionButton,
  Drawer,
  Indicator,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBell } from '@tabler/icons-react';
import { NotificationsList } from './NotificationsList';
import { useGetUnreadNotificationCount } from '@/entities/Notification';

export const NotificationsDrawer = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: unreadCount } = useGetUnreadNotificationCount();
  return (
    <>
      {unreadCount && unreadCount?.count > 0 ? (
        <Indicator inline offset={4} size={8} color="red">
          <MantineActionButton
            type="button"
            variant={'subtle'}
            color="gray"
            size="lg"
            onClick={open}
            aria-label="Toggle color scheme"
          >
            <IconBell size={16} />
          </MantineActionButton>
        </Indicator>
      ) : (
        <MantineActionButton
          type="button"
          variant={'subtle'}
          color="gray"
          size="lg"
          onClick={open}
          aria-label="Toggle color scheme"
        >
          <IconBell size={16} />
        </MantineActionButton>
      )}
      <Drawer
        opened={opened}
        onClose={close}
        title="Notifications"
        position="right"
      >
        <NotificationsList onClose={close}/>
      </Drawer>
    </>
  );
};
