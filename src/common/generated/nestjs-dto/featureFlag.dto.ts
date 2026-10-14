import { ApiProperty } from '@nestjs/swagger';

export class FeatureFlagDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  key: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  archived: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isFavorite: boolean;
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
