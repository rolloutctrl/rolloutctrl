import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
  NotificationSeverity,
} from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user_123', description: 'Target user ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'org_123', description: 'Organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    enum: Object.values(NotificationType),
    description: 'Notification type',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    enum: Object.values(NotificationSeverity),
    description: 'Notification severity',
  })
  @IsEnum(NotificationType)
  severity: NotificationSeverity;

  @ApiProperty({ example: 'Flag created', description: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A new feature flag was created',
    description: 'Notification message',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Link URL' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: 'user_456', description: 'Actor user ID' })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiPropertyOptional({ example: 'flag', description: 'Entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ example: 'flag_123', description: 'Entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'flag-created',
    description: 'Group key for aggregation',
  })
  @IsOptional()
  @IsString()
  groupKey?: string;

  @ApiPropertyOptional({
    enum: Object.values(NotificationChannel),
    isArray: true,
    description: 'Delivery channels',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];
}
