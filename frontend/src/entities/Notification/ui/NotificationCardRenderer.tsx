import {
  IconUserPlus,
  IconCheckupList,
  IconFlag,
  IconBuilding,
  IconFolder,
  IconKey,
  IconCreditCard,
  IconShield,
  IconSettings,
  IconBell,
} from '@tabler/icons-react';
import type { IconProps } from '@tabler/icons-react';
import type { NotificationType } from '@/shared/types/enums';
import { NotificationType as NotificationTypeEnum } from '@/shared/types/enums';
import type { Notification, NotificationActions } from '../model/types';
import { NotificationCard } from './NotificationCard';

type NotificationTypeConfig = {
  icon: React.ComponentType<IconProps>;
  color: string;
};

const TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  [NotificationTypeEnum.INVITATION]: { icon: IconUserPlus, color: 'blue' },
  [NotificationTypeEnum.APPROVAL]: { icon: IconCheckupList, color: 'violet' },
  [NotificationTypeEnum.FEATURE_FLAG]: { icon: IconFlag, color: 'teal' },
  [NotificationTypeEnum.ORGANIZATION]: { icon: IconBuilding, color: 'indigo' },
  [NotificationTypeEnum.PROJECT]: { icon: IconFolder, color: 'cyan' },
  [NotificationTypeEnum.API_KEY]: { icon: IconKey, color: 'orange' },
  [NotificationTypeEnum.BILLING]: { icon: IconCreditCard, color: 'grape' },
  [NotificationTypeEnum.SECURITY]: { icon: IconShield, color: 'red' },
  [NotificationTypeEnum.SYSTEM]: { icon: IconSettings, color: 'gray' },
};

const DEFAULT_CONFIG: NotificationTypeConfig = {
  icon: IconBell,
  color: 'gray',
};

type NotificationCardRendererProps = {
  notification: Notification;
  actions?: NotificationActions;
  onClose: () => void;
};

export const NotificationCardRenderer = ({
  notification,
  actions,
  onClose,
}: NotificationCardRendererProps) => {
  const config = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG;

  return (
    <NotificationCard
      notification={notification}
      icon={config.icon}
      color={config.color}
      actions={actions}
      onClose={onClose}
    />
  );
};
