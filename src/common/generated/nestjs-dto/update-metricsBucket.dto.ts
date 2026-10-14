import { MetricType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMetricsBucketDto {
  @ApiProperty({
    enum: MetricType,
    enumName: 'MetricType',
    required: false,
  })
  type?: MetricType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  bucketDate?: Date;
}
