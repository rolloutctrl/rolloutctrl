import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RuleOrder {
  @ApiProperty({ example: 'rule_123', description: 'Rule ID' })
  @IsString()
  id: string;
}

export class ReorderRulesRequestDto {
  @ApiProperty({
    type: 'array',
    description: 'Ordered list of rule IDs',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleOrder)
  rules: RuleOrder[];
}
