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

export class BatchVariantItemDto {
  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
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

export class BatchCreateStrategyVariantsRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchVariantItemDto)
  variants: BatchVariantItemDto[];
}
