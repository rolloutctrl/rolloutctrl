import { ActionEffect } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { ActionStrategy } from './actionStrategy.entity';

export class Action {
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
  enabled: boolean;
  @ApiProperty({
    enum: ActionEffect,
    enumName: 'ActionEffect',
  })
  defaultEffect: ActionEffect;
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
    type: () => ActionStrategy,
    isArray: true,
    required: false,
  })
  strategies?: ActionStrategy[];
}
