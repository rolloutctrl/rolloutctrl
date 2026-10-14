import {
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
} from 'class-validator';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import { VariantColors } from 'src/common/constants/variant.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddExistingVariantDto {
  @ApiProperty({ example: 'var_123', description: 'Existing variant ID' })
  @IsString()
  variantId: string;

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

export class CreateAndAddVariantDto {
  @ApiProperty({ example: 'Control', description: 'Variant name' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: [...VariantColors],
    description: 'Color tag for the variant',
  })
  @IsIn(VariantColors)
  colorTag: string;

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

export class CreateStrategyVariantRequestDto {
  @ApiPropertyOptional({
    example: 'var_123',
    description: 'Existing variant ID (to add existing)',
  })
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({
    example: 'Control',
    description: 'Variant name (to create new)',
  })
  @IsOptional()
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
