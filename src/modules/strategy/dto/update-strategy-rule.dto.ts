import { PartialType } from '@nestjs/mapped-types';
import { CreateStrategyRuleRequestDto } from './create-strategy-rule.dto';

export class UpdateStrategyRuleRequestDto extends PartialType(
  CreateStrategyRuleRequestDto,
) {}
