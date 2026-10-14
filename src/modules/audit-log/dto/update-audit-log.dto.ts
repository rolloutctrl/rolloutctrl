import { IsOptional, IsEnum, IsObject, IsString } from 'class-validator';
import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuditLogDto {
  @ApiPropertyOptional({ example: 'proj_123', description: 'Project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ example: 'user_123', description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    enum: Object.values(AuditAction),
    description: 'Audit action type',
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    enum: Object.values(ResourceType),
    description: 'Resource type',
  })
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @ApiPropertyOptional({ description: 'Resource ID' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Resource name' })
  @IsOptional()
  @IsString()
  resourceName?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
