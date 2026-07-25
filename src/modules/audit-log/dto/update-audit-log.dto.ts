import { IsOptional, IsEnum, IsObject, IsString } from 'class-validator';
import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';

export class UpdateAuditLogDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  resourceName?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
