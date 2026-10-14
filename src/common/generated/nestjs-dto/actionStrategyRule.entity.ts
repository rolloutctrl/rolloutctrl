import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ActionStrategy } from './actionStrategy.entity';

export class ActionStrategyRule {
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
    type: () => Object,
  })
  value: Prisma.JsonValue;
  @ApiProperty({
    type: 'boolean',
  })
  not: boolean;
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
    type: () => ActionStrategy,
    required: false,
  })
  strategy?: ActionStrategy;
}
