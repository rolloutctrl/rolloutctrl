import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StrategyRuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
