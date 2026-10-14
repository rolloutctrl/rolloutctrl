import {
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
  Prisma,
} from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: NotificationType,
    enumName: 'NotificationType',
  })
  type: NotificationType;
  @ApiProperty({
    enum: NotificationSeverity,
    enumName: 'NotificationSeverity',
  })
  severity: NotificationSeverity;
  @ApiProperty({
    enum: NotificationStatus,
    enumName: 'NotificationStatus',
  })
  status: NotificationStatus;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  message: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  link: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  actorUserId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  entityType: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  entityId: string | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  metadata: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  readAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  groupKey: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  count: number;
}
