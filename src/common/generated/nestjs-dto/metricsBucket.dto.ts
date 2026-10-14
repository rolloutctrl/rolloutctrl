import { MetricType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MetricsBucketDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: MetricType,
    enumName: 'MetricType',
  })
  type: MetricType;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  count: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  bucketDate: Date;
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
