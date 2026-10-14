import { ApiProperty } from '@nestjs/swagger';

export class CreateStrategyVariantDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  weight: number;
}
