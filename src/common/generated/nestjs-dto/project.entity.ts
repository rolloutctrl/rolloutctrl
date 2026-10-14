import { ApiProperty } from '@nestjs/swagger';
import { ApiKey } from './apiKey.entity';
import { ProjectMember } from './projectMember.entity';
import { Environment } from './environment.entity';
import { FeatureFlag } from './featureFlag.entity';
import { Segment } from './segment.entity';
import { Action } from './action.entity';
import { MetricsBucket } from './metricsBucket.entity';
import { Organization } from './organization.entity';
import { ExposureEvent } from './exposureEvent.entity';
import { AuditLog } from './auditLog.entity';

export class Project {
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
  })
  slug: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: () => ApiKey,
    isArray: true,
    required: false,
  })
  apiKeys?: ApiKey[];
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
    type: () => ProjectMember,
    isArray: true,
    required: false,
  })
  members?: ProjectMember[];
  @ApiProperty({
    type: () => Environment,
    isArray: true,
    required: false,
  })
  environments?: Environment[];
  @ApiProperty({
    type: () => FeatureFlag,
    isArray: true,
    required: false,
  })
  featureFlags?: FeatureFlag[];
  @ApiProperty({
    type: () => Segment,
    isArray: true,
    required: false,
  })
  segments?: Segment[];
  @ApiProperty({
    type: () => Action,
    isArray: true,
    required: false,
  })
  actions?: Action[];
  @ApiProperty({
    type: () => MetricsBucket,
    isArray: true,
    required: false,
  })
  metrics?: MetricsBucket[];
  @ApiProperty({
    type: () => Organization,
    required: false,
    nullable: true,
  })
  organization?: Organization | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  organizationId: string | null;
  @ApiProperty({
    type: () => ExposureEvent,
    isArray: true,
    required: false,
  })
  exposureEvents?: ExposureEvent[];
  @ApiProperty({
    type: () => AuditLog,
    isArray: true,
    required: false,
  })
  auditLogs?: AuditLog[];
}
