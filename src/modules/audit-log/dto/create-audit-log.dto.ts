import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';

export class CreateAuditLogDto {
  @IsNotEmpty()
  organizationId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @IsNotEmpty()
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsOptional()
  @IsString()
  resourceName?: string;

  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
