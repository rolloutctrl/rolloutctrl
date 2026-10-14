import { ApiProperty } from '@nestjs/swagger';
import { FeatureFlag } from './featureFlag.entity';
import { Environment } from './environment.entity';
import { Strategy } from './strategy.entity';
import { ExposureEvent } from './exposureEvent.entity';
import { MetricsBucket } from './metricsBucket.entity';

export class FeatureFlagEnvironment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  featureFlagId: string;
  @ApiProperty({
    type: 'string',
  })
  environmentId: string;
  @ApiProperty({
    type: 'boolean',
  })
  enabled: boolean;
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
    type: () => FeatureFlag,
    required: false,
  })
  featureFlag?: FeatureFlag;
  @ApiProperty({
    type: () => Environment,
    required: false,
  })
  environment?: Environment;
  @ApiProperty({
    type: () => Strategy,
    isArray: true,
    required: false,
  })
  strategies?: Strategy[];
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
