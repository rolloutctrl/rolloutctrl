import { ApiProperty } from '@nestjs/swagger';
import { Strategy } from './strategy.entity';
import { Variant } from './variant.entity';

export class StrategyVariant {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  strategyId: string;
  @ApiProperty({
    type: 'string',
  })
  variantId: string;
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
    type: () => Strategy,
    required: false,
  })
  strategy?: Strategy;
  @ApiProperty({
    type: () => Variant,
    required: false,
  })
  variant?: Variant;
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
