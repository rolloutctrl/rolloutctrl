import { ActionEffect, MatchType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Segment } from './segment.entity';
import { Action } from './action.entity';
import { ActionStrategyRule } from './actionStrategyRule.entity';

export class ActionStrategy {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  actionId: string;
  @ApiProperty({
    enum: ActionEffect,
    enumName: 'ActionEffect',
  })
  effect: ActionEffect;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  priority: number;
  @ApiProperty({
    type: 'boolean',
  })
  enabled: boolean;
  @ApiProperty({
    type: () => Segment,
    isArray: true,
    required: false,
  })
  segments?: Segment[];
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
    type: () => Action,
    required: false,
  })
  action?: Action;
  @ApiProperty({
    type: () => ActionStrategyRule,
    isArray: true,
    required: false,
  })
  rules?: ActionStrategyRule[];
}
