import { ApiProperty } from '@nestjs/swagger';

export class UpdateSegmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  key?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  name?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
}
