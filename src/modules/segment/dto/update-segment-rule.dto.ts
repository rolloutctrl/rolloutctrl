import { PartialType } from '@nestjs/swagger';
import { CreateSegmentRuleRequestDto } from './create-segment-rule.dto';

export class UpdateSegmentRuleRequestDto extends PartialType(
  CreateSegmentRuleRequestDto,
) {}
