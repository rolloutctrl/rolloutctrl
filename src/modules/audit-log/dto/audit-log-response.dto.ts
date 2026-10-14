import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'log_123', description: 'Audit log ID' })
  id: string;

  @ApiPropertyOptional({ example: 'proj_123', description: 'Project ID' })
  projectId: string | null;

  @ApiPropertyOptional({ example: 'user_123', description: 'User ID' })
  userId: string | null;

  @ApiProperty({
    enum: Object.values(AuditAction),
    description: 'Audit action type',
  })
  action: AuditAction;

  @ApiProperty({
    enum: Object.values(ResourceType),
    description: 'Resource type',
  })
  resourceType: ResourceType;

  @ApiProperty({ example: 'flag_123', description: 'Resource ID' })
  resourceId: string;

  @ApiPropertyOptional({ description: 'Resource name' })
  resourceName?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: Object,
  })
  metadata: any;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}
