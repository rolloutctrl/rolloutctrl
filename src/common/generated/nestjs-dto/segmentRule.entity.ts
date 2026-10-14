import { Operator, Prisma } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Segment } from './segment.entity';

export class SegmentRule {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  segmentId: string;
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
    type: 'integer',
    format: 'int32',
  })
  priority: number;
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
    type: () => Segment,
    required: false,
  })
  segment?: Segment;
}
