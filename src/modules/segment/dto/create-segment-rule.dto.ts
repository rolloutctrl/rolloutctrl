import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { Operator } from 'src/common/generated/prisma/enums';

export class CreateSegmentRuleRequestDto {
  @IsString()
  segmentId: string;

  @IsString()
  field: string;

  @IsEnum(Operator)
  operator: Operator;

  value: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}
