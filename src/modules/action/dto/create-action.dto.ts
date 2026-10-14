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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActionStrategyRuleDto {
  @ApiProperty({ example: 'country', description: 'Field to evaluate' })
  @IsString()
  field: string;

  @ApiProperty({
    enum: Object.values(Operator),
    description: 'Comparison operator',
  })
  @IsEnum(Operator)
  operator: Operator;

  @ApiProperty({ example: 'US', description: 'Value to compare against' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ default: false, description: 'Negate the rule' })
  @IsOptional()
  @IsBoolean()
  not?: boolean;
}

export class CreateActionStrategyDto {
  @ApiProperty({
    enum: Object.values(ActionEffect),
    description: 'Effect when strategy matches',
  })
  @IsEnum(ActionEffect)
  effect: ActionEffect;

  @ApiPropertyOptional({ minimum: 0, description: 'Strategy priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'Whether the strategy is enabled',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Segment IDs attached to this strategy',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];

  @ApiPropertyOptional({
    enum: Object.values(MatchType),
    description: 'How rules are matched',
  })
  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Rules for this strategy',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionStrategyRuleDto)
  rules?: CreateActionStrategyRuleDto[];
}

export class CreateActionRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'my-action', description: 'Action key' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ description: 'Action description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Whether the action is enabled',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    enum: Object.values(ActionEffect),
    description: 'Default effect',
  })
  @IsOptional()
  @IsEnum(ActionEffect)
  defaultEffect?: ActionEffect;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Strategies for this action',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActionStrategyDto)
  strategies?: CreateActionStrategyDto[];
}
