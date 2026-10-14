import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDeliveryDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
