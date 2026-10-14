import { MetricType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { FeatureFlagEnvironment } from './featureFlagEnvironment.entity';
import { FeatureFlag } from './featureFlag.entity';
import { Strategy } from './strategy.entity';
import { Variant } from './variant.entity';

export class MetricsBucket {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  featureFlagEnvironmentId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  featureFlagId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  strategyId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  variantId: string | null;
  @ApiProperty({
    enum: MetricType,
    enumName: 'MetricType',
  })
  type: MetricType;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  count: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  bucketDate: Date;
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
    type: () => Project,
    required: false,
  })
  project?: Project;
  @ApiProperty({
    type: () => FeatureFlagEnvironment,
    required: false,
  })
  featureFlagEnvironment?: FeatureFlagEnvironment;
  @ApiProperty({
    type: () => FeatureFlag,
    required: false,
    nullable: true,
  })
  featureFlag?: FeatureFlag | null;
  @ApiProperty({
    type: () => Strategy,
    required: false,
    nullable: true,
  })
  strategy?: Strategy | null;
  @ApiProperty({
    type: () => Variant,
    required: false,
    nullable: true,
  })
  variant?: Variant | null;
}
