import { IsString, IsEnum, IsBoolean } from 'class-validator';
import { Operator } from 'src/common/generated/prisma/enums';

export class CreateStrategyRuleRequestDto {
  @IsString()
  strategyId: string;

  @IsString()
  field: string;

  @IsEnum(Operator)
  operator: Operator;

  @IsBoolean()
  not?: boolean;

  value: any;
}
