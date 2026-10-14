import { ApiProperty } from '@nestjs/swagger';

export class ExposureEventDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  contextKey: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  stickinessField: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
