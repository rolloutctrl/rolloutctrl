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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStrategyRuleDto {
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

  @ApiProperty({ default: false, description: 'Negate the rule' })
  @IsBoolean()
  not: boolean;

  @ApiPropertyOptional({ minimum: 0, description: 'Rule priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

export class CreateStrategyRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({
    type: [String],
    description: 'Feature flag environment IDs to apply the strategy to',
  })
  @IsArray()
  @IsString({ each: true })
  featureFlagEnvironmentIds: string[];

  @ApiPropertyOptional({ example: 'My Strategy', description: 'Strategy name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    description: 'Rollout percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @ApiPropertyOptional({
    example: 'userId',
    description: 'Stickiness field for rollout',
  })
  @IsOptional()
  @IsString()
  rolloutStickinessField?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Segment IDs attached to this strategy',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];

  @ApiPropertyOptional({ minimum: 0, description: 'Strategy priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ example: 'UTC', description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Start date',
  })
  @IsOptional()
  @IsString()
  startsAt?: Date | string;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'End date',
  })
  @IsOptional()
  @IsString()
  endsAt?: Date | string;

  @ApiPropertyOptional({
    default: false,
    description: 'Whether this is the default strategy',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Rules for this strategy',
  })
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
