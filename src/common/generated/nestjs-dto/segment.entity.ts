import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { Strategy } from './strategy.entity';
import { ActionStrategy } from './actionStrategy.entity';
import { SegmentRule } from './segmentRule.entity';

export class Segment {
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
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
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
    type: () => Project,
    required: false,
  })
  project?: Project;
  @ApiProperty({
    type: () => Strategy,
    isArray: true,
    required: false,
  })
  strategies?: Strategy[];
  @ApiProperty({
    type: () => ActionStrategy,
    isArray: true,
    required: false,
  })
  actionStrategies?: ActionStrategy[];
  @ApiProperty({
    type: () => SegmentRule,
    isArray: true,
    required: false,
  })
  rules?: SegmentRule[];
}
