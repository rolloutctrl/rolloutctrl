import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class RuleOrder {
  @IsString()
  id: string;
}

export class ReorderRulesRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleOrder)
  rules: RuleOrder[];
}
