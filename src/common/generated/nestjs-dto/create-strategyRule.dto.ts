import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStrategyRuleDto {
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
  value: Prisma.InputJsonValue;
}
