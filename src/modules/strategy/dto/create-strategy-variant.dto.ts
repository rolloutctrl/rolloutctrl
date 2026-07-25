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

export class AddExistingVariantDto {
  @IsString()
  variantId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}

export class CreateAndAddVariantDto {
  @IsString()
  name: string;

  @IsIn(VariantColors)
  colorTag: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VariantPayloadType)
  payloadType?: VariantPayloadType;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.payloadType === VariantPayloadType.JSON)
  @IsJSON()
  payload?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}

export class CreateStrategyVariantRequestDto {
  @IsOptional()
  variantId?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsIn(VariantColors)
  colorTag?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VariantPayloadType)
  payloadType?: VariantPayloadType;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.payloadType === VariantPayloadType.JSON)
  @IsJSON()
  payload?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}
