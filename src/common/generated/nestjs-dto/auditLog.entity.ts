import { AuditAction, Prisma, ResourceType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export class AuditLog {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  organizationId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  projectId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userId: string | null;
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
  @ApiProperty({
    type: () => Project,
    required: false,
    nullable: true,
  })
  project?: Project | null;
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: User | null;
  @ApiProperty({
    type: () => Organization,
    required: false,
  })
  organization?: Organization;
}
