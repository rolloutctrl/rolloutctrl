import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Project } from './project.entity';
import { AuditLog } from './auditLog.entity';
import { Notification } from './notification.entity';

export class Organization {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  url: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: () => User,
    isArray: true,
    required: false,
  })
  users?: User[];
  @ApiProperty({
    type: () => Project,
    isArray: true,
    required: false,
  })
  projects?: Project[];
  @ApiProperty({
    type: () => AuditLog,
    isArray: true,
    required: false,
  })
  auditLogs?: AuditLog[];
  @ApiProperty({
    type: () => Notification,
    isArray: true,
    required: false,
  })
  notifications?: Notification[];
}
