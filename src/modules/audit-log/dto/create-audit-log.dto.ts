import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'org_123', description: 'Organization ID' })
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ example: 'proj_123', description: 'Project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ example: 'user_123', description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    enum: Object.values(AuditAction),
    description: 'Audit action type',
  })
  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({
    enum: Object.values(ResourceType),
    description: 'Resource type',
  })
  @IsNotEmpty()
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiPropertyOptional({ description: 'Resource name' })
  @IsOptional()
  @IsString()
  resourceName?: string;

  @ApiProperty({ example: 'flag_123', description: 'Resource ID' })
  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
