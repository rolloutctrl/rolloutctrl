import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeatureFlagDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  key?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  createdById?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  createdByName?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  createdByEmail?: string;
}
