import { AuditAction, Prisma, ResourceType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuditLogDto {
  @ApiProperty({
    enum: AuditAction,
    enumName: 'AuditAction',
    required: false,
  })
  action?: AuditAction;
  @ApiProperty({
    enum: ResourceType,
    enumName: 'ResourceType',
    required: false,
  })
  resourceType?: ResourceType;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  resourceId?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  resourceName?: string | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}
