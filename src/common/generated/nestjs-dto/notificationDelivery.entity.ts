import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from './notification.entity';

export class NotificationDelivery {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  notificationId: string;
  @ApiProperty({
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
  })
  channel: NotificationChannel;
  @ApiProperty({
    enum: NotificationDeliveryStatus,
    enumName: 'NotificationDeliveryStatus',
  })
  status: NotificationDeliveryStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  sentAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  error: string | null;
  @ApiProperty({
    type: () => Notification,
    required: false,
  })
  notification?: Notification;
}
