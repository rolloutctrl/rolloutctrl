import { OrganizationRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';
import { Session } from './session.entity';
import { ProjectMember } from './projectMember.entity';
import { AuditLog } from './auditLog.entity';
import { UserIdentity } from './userIdentity.entity';
import { Notification } from './notification.entity';

export class User {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  email: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  password: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  avatar: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  bio: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  joinedAt: Date | null;
  @ApiProperty({
    type: 'string',
  })
  organizationId: string;
  @ApiProperty({
    type: () => Organization,
    required: false,
  })
  organization?: Organization;
  @ApiProperty({
    enum: OrganizationRole,
    enumName: 'OrganizationRole',
  })
  organizationRole: OrganizationRole;
  @ApiProperty({
    type: () => Session,
    isArray: true,
    required: false,
  })
  sessions?: Session[];
  @ApiProperty({
    type: () => ProjectMember,
    isArray: true,
    required: false,
  })
  projectMembers?: ProjectMember[];
  @ApiProperty({
    type: () => AuditLog,
    isArray: true,
    required: false,
  })
  auditLogs?: AuditLog[];
  @ApiProperty({
    type: () => UserIdentity,
    isArray: true,
    required: false,
  })
  userIdentities?: UserIdentity[];
  @ApiProperty({
    type: () => Notification,
    isArray: true,
    required: false,
  })
  notifications?: Notification[];
}
