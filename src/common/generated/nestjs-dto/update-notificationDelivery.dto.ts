import { NotificationChannel } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDeliveryDto {
  @ApiProperty({
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
    required: false,
  })
  channel?: NotificationChannel;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  sentAt?: Date | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  error?: string | null;
}
