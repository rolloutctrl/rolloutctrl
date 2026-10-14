import { ApiProperty } from '@nestjs/swagger';

export class UpdateStrategyVariantDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  weight?: number;
}
