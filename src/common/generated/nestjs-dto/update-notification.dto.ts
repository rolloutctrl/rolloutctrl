import {
  NotificationSeverity,
  NotificationType,
  Prisma,
} from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    enumName: 'NotificationType',
    required: false,
  })
  type?: NotificationType;
  @ApiProperty({
    enum: NotificationSeverity,
    enumName: 'NotificationSeverity',
    required: false,
  })
  severity?: NotificationSeverity;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  title?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  message?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  link?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  actorUserId?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  entityType?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  entityId?: string | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  readAt?: Date | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  groupKey?: string | null;
}
