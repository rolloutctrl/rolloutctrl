import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureFlagDto {
  @ApiProperty({
    type: 'string',
  })
  key: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
  @ApiProperty({
    type: 'string',
  })
  createdById: string;
  @ApiProperty({
    type: 'string',
  })
  createdByName: string;
  @ApiProperty({
    type: 'string',
  })
  createdByEmail: string;
}
