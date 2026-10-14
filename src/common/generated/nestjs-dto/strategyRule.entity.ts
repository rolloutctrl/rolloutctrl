import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Strategy } from './strategy.entity';

export class StrategyRule {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  strategyId: string;
  @ApiProperty({
    type: 'string',
  })
  field: string;
  @ApiProperty({
    enum: Operator,
    enumName: 'Operator',
  })
  operator: Operator;
  @ApiProperty({
    type: 'boolean',
  })
  not: boolean;
  @ApiProperty({
    type: () => Object,
  })
  value: Prisma.JsonValue;
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
    type: () => Strategy,
    required: false,
  })
  strategy?: Strategy;
}
