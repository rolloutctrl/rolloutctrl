import { ApiProperty } from '@nestjs/swagger';

export class UpdateExposureEventDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  contextKey?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  stickinessField?: string | null;
}
