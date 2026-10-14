import { MetricType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricsBucketDto {
  @ApiProperty({
    enum: MetricType,
    enumName: 'MetricType',
  })
  type: MetricType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  bucketDate: Date;
}
