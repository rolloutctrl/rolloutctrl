import { ApiProperty } from '@nestjs/swagger';

export class StrategyVariantDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  weight: number;
  @ApiProperty({
    type: 'boolean',
  })
  isCustomWeight: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  isArchived: boolean;
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
}
