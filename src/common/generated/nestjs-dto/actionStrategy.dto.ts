import { ActionEffect, MatchType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ActionStrategyDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
