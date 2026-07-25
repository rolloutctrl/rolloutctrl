import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Operator } from 'src/common/generated/prisma/enums';

export class CreateStrategyRuleDto {
  @IsString()
  field: string;

  @IsEnum(Operator)
  operator: Operator;

  @IsString()
  value: string;

  @IsBoolean()
  not: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

export class CreateStrategyRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsArray()
  @IsString({ each: true })
  featureFlagEnvironmentIds: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @IsOptional()
  @IsString()
  rolloutStickinessField?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  startsAt?: Date | string;

  @IsOptional()
  @IsString()
  endsAt?: Date | string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStrategyRuleDto)
  rules?: CreateStrategyRuleDto[];

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateStrategyVariantDto)
  // variants?: CreateStrategyVariantDto[];
}
