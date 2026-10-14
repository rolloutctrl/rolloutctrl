import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsEnum,
  IsIn,
  IsJSON,
  ValidateIf,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import { VariantColors } from 'src/common/constants/variant.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchVariantItemDto {
  @ApiPropertyOptional({
    example: 'var_123',
    description: 'Existing variant ID',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ example: 'Control', description: 'Variant name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: [...VariantColors],
    description: 'Color tag for the variant',
  })
  @IsOptional()
  @IsIn(VariantColors)
  colorTag?: string;

  @ApiPropertyOptional({ description: 'Variant description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: Object.values(VariantPayloadType),
    description: 'Payload type',
  })
  @IsOptional()
  @IsEnum(VariantPayloadType)
  payloadType?: VariantPayloadType;

  @ApiPropertyOptional({
    description: 'Variant payload (JSON string when payloadType is JSON)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.payloadType === VariantPayloadType.JSON)
  @IsJSON()
  payload?: any;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    description: 'Weight percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @ApiPropertyOptional({ description: 'Whether custom weight is used' })
  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}

export class BatchCreateStrategyVariantsRequestDto {
  @ApiProperty({
    type: 'array',
    description: 'Array of variants to batch create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchVariantItemDto)
  variants: BatchVariantItemDto[];
}
