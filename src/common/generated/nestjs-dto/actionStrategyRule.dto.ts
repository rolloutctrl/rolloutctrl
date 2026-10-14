import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ActionStrategyRuleDto {
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
}
