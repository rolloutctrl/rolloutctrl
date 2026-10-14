import { PartialType } from '@nestjs/swagger';
import { CreateStrategyRuleRequestDto } from './create-strategy-rule.dto';

export class UpdateStrategyRuleRequestDto extends PartialType(
  CreateStrategyRuleRequestDto,
) {}
