import { MatchType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { FeatureFlagEnvironment } from './featureFlagEnvironment.entity';
import { StrategyRule } from './strategyRule.entity';
import { StrategyVariant } from './strategyVariant.entity';
import { Segment } from './segment.entity';
import { ExposureEvent } from './exposureEvent.entity';
import { MetricsBucket } from './metricsBucket.entity';

export class Strategy {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'boolean',
  })
  isDefault: boolean;
  @ApiProperty({
    type: 'string',
  })
  featureFlagEnvironmentId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  enabled: boolean;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  rolloutPercentage: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  rolloutStickinessField: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  timezone: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  startsAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  endsAt: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  priority: number;
  @ApiProperty({
    enum: MatchType,
    enumName: 'MatchType',
  })
  matchType: MatchType;
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
    type: 'boolean',
  })
  isArchived: boolean;
  @ApiProperty({
    type: () => FeatureFlagEnvironment,
    required: false,
  })
  featureFlagEnvironment?: FeatureFlagEnvironment;
  @ApiProperty({
    type: () => StrategyRule,
    isArray: true,
    required: false,
  })
  rules?: StrategyRule[];
  @ApiProperty({
    type: () => StrategyVariant,
    isArray: true,
    required: false,
  })
  strategyVariants?: StrategyVariant[];
  @ApiProperty({
    type: () => Segment,
    isArray: true,
    required: false,
  })
  segments?: Segment[];
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
