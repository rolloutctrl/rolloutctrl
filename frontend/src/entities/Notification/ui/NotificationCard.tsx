import { Badge, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import type { IconProps } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Notification, NotificationActions } from '../model/types';
import type { NotificationSeverity, NotificationStatus } from '@/shared/types/enums';
import { NotificationStatus as NotificationStatusEnum } from '@/shared/types/enums';

dayjs.extend(relativeTime);

export type NotificationCardProps = {
  notification: Notification;
  icon: React.ComponentType<IconProps>;
  color: string;
  actions?: NotificationActions;
  onClose: () => void;
};

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  INFO: 'blue',
  SUCCESS: 'green',
  WARNING: 'yellow',
  ERROR: 'red',
};

const STATUS_LABEL: Record<NotificationStatus, string> = {
  UNREAD: 'Unread',
  READ: 'Read',
  ARCHIVED: 'Archived',
};

export const NotificationCard = ({
  notification,
  icon: Icon,
  color,
  actions,
  onClose,
}: NotificationCardProps) => {
  const isUnread = notification.status === NotificationStatusEnum.UNREAD;
  const severityColor = SEVERITY_COLOR[notification.severity];

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      onMouseLeave={() => actions?.handleMarkAsRead?.(notification)}
      onTouchEnd={() => actions?.handleMarkAsRead?.(notification)}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: `var(--mantine-color-${severityColor}-6)`,
        opacity: notification.status === NotificationStatusEnum.ARCHIVED ? 0.6 : 1,
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <ThemeIcon size="md" variant="light" color={color} radius="sm" className="shrink-0 mt-1">
          <Icon size={18} />
        </ThemeIcon>

        <Stack gap={4} className="flex-1 min-w-0">
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Text fw={600} size="sm" lineClamp={1} c={isUnread ? undefined : 'dimmed'}>
              {notification.title}
            </Text>
            <Text size="xs" c="dimmed" className="shrink-0">
              {dayjs(notification.createdAt).fromNow()}
            </Text>
          </Group>

          <Text size="xs" c="dimmed" lineClamp={2}>
            {notification.message}
          </Text>

          <Group gap="xs" mt={4} wrap="nowrap" align="center">
            {isUnread && (
              <Badge size="xs" variant="dot" color={severityColor}>
                {STATUS_LABEL[notification.status]}
              </Badge>
            )}
            {notification.count > 1 && (
              <Badge size="xs" variant="light" color="gray">
                x{notification.count}
              </Badge>
            )}
            {notification.link && (
              <Text
                component={Link}
                to={notification.link}
                size="xs"
                c={`${color}.6`}
                onClick={onClose}
                className="hover:underline"
              >
                Open
              </Text>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};