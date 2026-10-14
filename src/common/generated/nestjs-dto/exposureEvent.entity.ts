import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { FeatureFlag } from './featureFlag.entity';
import { FeatureFlagEnvironment } from './featureFlagEnvironment.entity';
import { Strategy } from './strategy.entity';
import { Variant } from './variant.entity';

export class ExposureEvent {
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
  })
  featureFlagId: string;
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
    type: 'string',
    nullable: true,
  })
  contextKey: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  stickinessField: string | null;
  @ApiProperty({
    type: () => Project,
    required: false,
  })
  project?: Project;
  @ApiProperty({
    type: () => FeatureFlag,
    required: false,
  })
  featureFlag?: FeatureFlag;
  @ApiProperty({
    type: () => FeatureFlagEnvironment,
    required: false,
  })
  featureFlagEnvironment?: FeatureFlagEnvironment;
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
