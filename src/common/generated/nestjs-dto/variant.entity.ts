import { Prisma, VariantPayloadType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { FeatureFlag } from './featureFlag.entity';
import { StrategyVariant } from './strategyVariant.entity';
import { ExposureEvent } from './exposureEvent.entity';
import { MetricsBucket } from './metricsBucket.entity';

export class Variant {
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
    enum: VariantPayloadType,
    enumName: 'VariantPayloadType',
    nullable: true,
  })
  payloadType: VariantPayloadType | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  payload: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  colorTag: string;
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
    type: 'string',
  })
  featureFlagId: string;
  @ApiProperty({
    type: () => FeatureFlag,
    required: false,
  })
  featureFlag?: FeatureFlag;
  @ApiProperty({
    type: () => StrategyVariant,
    isArray: true,
    required: false,
  })
  strategyVariants?: StrategyVariant[];
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
