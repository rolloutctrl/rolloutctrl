import { IsString, IsEnum, IsBoolean } from 'class-validator';
import { Operator } from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStrategyRuleRequestDto {
  @ApiProperty({ example: 'strat_123', description: 'Strategy ID' })
  @IsString()
  strategyId: string;

  @ApiProperty({ example: 'country', description: 'Field to evaluate' })
  @IsString()
  field: string;

  @ApiProperty({
    enum: Object.values(Operator),
    description: 'Comparison operator',
  })
  @IsEnum(Operator)
  operator: Operator;

  @ApiPropertyOptional({ default: false, description: 'Negate the rule' })
  @IsBoolean()
  not?: boolean;

  @ApiProperty({ example: 'US', description: 'Value to compare against' })
  value: any;
}
