import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSegmentRuleDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  field?: string;
  @ApiProperty({
    enum: Operator,
    enumName: 'Operator',
    required: false,
  })
  operator?: Operator;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  value?: Prisma.InputJsonValue;
}
