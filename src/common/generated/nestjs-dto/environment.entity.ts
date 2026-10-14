import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { FeatureFlagEnvironment } from './featureFlagEnvironment.entity';

export class Environment {
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
  name: string;
  @ApiProperty({
    type: 'boolean',
  })
  isSystem: boolean;
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
    type: 'integer',
    format: 'int32',
  })
  version: number;
  @ApiProperty({
    type: 'boolean',
  })
  approveRequired: boolean;
  @ApiProperty({
    type: () => Project,
    required: false,
  })
  project?: Project;
  @ApiProperty({
    type: () => FeatureFlagEnvironment,
    isArray: true,
    required: false,
  })
  featureFlags?: FeatureFlagEnvironment[];
}
