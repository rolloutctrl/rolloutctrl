import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ActionEffect,
  MatchType,
  Operator,
} from 'src/common/generated/prisma/enums';

export class UpdateActionStrategyRuleDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  field: string;

  @IsEnum(Operator)
  operator: Operator;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  not?: boolean;
}

export class UpdateActionStrategyDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsEnum(ActionEffect)
  effect: ActionEffect;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];

  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateActionStrategyRuleDto)
  rules?: UpdateActionStrategyRuleDto[];
}

export class UpdateActionRequestDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsEnum(ActionEffect)
  defaultEffect?: ActionEffect;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateActionStrategyDto)
  strategies?: UpdateActionStrategyDto[];
}
