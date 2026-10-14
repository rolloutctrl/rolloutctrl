import { NotificationChannel } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDeliveryDto {
  @ApiProperty({
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
  })
  channel: NotificationChannel;
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
