import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { FeatureFlagEnvironment } from './featureFlagEnvironment.entity';
import { Variant } from './variant.entity';
import { ExposureEvent } from './exposureEvent.entity';
import { MetricsBucket } from './metricsBucket.entity';

export class FeatureFlag {
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
  key: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  archived: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isFavorite: boolean;
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
    type: 'string',
  })
  createdById: string;
  @ApiProperty({
    type: 'string',
  })
  createdByName: string;
  @ApiProperty({
    type: 'string',
  })
  createdByEmail: string;
  @ApiProperty({
    type: () => FeatureFlagEnvironment,
    isArray: true,
    required: false,
  })
  environments?: FeatureFlagEnvironment[];
  @ApiProperty({
    type: () => Variant,
    isArray: true,
    required: false,
  })
  variants?: Variant[];
  @ApiProperty({
    type: () => ExposureEvent,
    isArray: true,
    required: false,
  })
  exposureEvents?: ExposureEvent[];
  @ApiProperty({
    type: () => MetricsBucket,
    isArray: true,
    required: false,
  })
  metrics?: MetricsBucket[];
}
