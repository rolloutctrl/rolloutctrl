import { ApiProperty } from '@nestjs/swagger';

export class CreateSegmentDto {
  @ApiProperty({
    type: 'string',
  })
  key: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
}
