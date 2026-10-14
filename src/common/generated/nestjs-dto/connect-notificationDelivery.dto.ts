import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../prisma/client';

export class NotificationDeliveryNotificationIdChannelUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  notificationId: string;
  @ApiProperty({
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
  })
  channel: NotificationChannel;
}

@ApiExtraModels(NotificationDeliveryNotificationIdChannelUniqueInputDto)
export class ConnectNotificationDeliveryDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: NotificationDeliveryNotificationIdChannelUniqueInputDto,
    required: false,
  })
  notificationId_channel?: NotificationDeliveryNotificationIdChannelUniqueInputDto;
}
