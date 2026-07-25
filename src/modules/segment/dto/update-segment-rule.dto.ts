import { PartialType } from '@nestjs/mapped-types';
import { CreateSegmentRuleRequestDto } from './create-segment-rule.dto';

export class UpdateSegmentRuleRequestDto extends PartialType(
  CreateSegmentRuleRequestDto,
) {}
