import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class StrategyVariantStrategyIdVariantIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  strategyId: string;
  @ApiProperty({
    type: 'string',
  })
  variantId: string;
}

@ApiExtraModels(StrategyVariantStrategyIdVariantIdUniqueInputDto)
export class ConnectStrategyVariantDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: StrategyVariantStrategyIdVariantIdUniqueInputDto,
    required: false,
  })
  strategyId_variantId?: StrategyVariantStrategyIdVariantIdUniqueInputDto;
}
