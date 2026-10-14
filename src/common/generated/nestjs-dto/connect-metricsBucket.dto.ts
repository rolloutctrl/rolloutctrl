import { ApiProperty } from '@nestjs/swagger';

export class ConnectMetricsBucketDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
