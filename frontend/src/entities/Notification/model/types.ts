import type {
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
} from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

export type Notification = {
  id: string;
  userId: string;
  organizationId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  status: NotificationStatus;
  title: string;
  message: string;
  link?: string;
  actorUserId?: Nullable<string>;
  entityType?: Nullable<string>;
  entityId?: Nullable<string>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt: Date;
  groupKey: Nullable<string>;
  count: number;
};

export type NotificationActions = {
  handleMarkAsRead?: (notification?: Notification) => void | Promise<void>;
};

export type NotificationsResponse = {
  notifications: Notification[];
  nextCursor: Nullable<string>;
  hasMore: boolean;
};