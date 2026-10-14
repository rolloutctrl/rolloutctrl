import { AuditAction, Prisma, ResourceType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: AuditAction,
    enumName: 'AuditAction',
  })
  action: AuditAction;
  @ApiProperty({
    enum: ResourceType,
    enumName: 'ResourceType',
  })
  resourceType: ResourceType;
  @ApiProperty({
    type: 'string',
  })
  resourceId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  resourceName: string | null;
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
}
