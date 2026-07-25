import {
  IsString,
  IsOptional,
  Length,
  Matches,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Operator } from 'src/common/generated/prisma/enums';

export class CreateSegmentRequestDto {
  @IsString()
  projectId: string;

  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9.-]+$/)
  key: string;

  @IsString()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsArray()
  rules: CreateSegmentRuleRequestDto[];
}

export class CreateSegmentRuleRequestDto {
  @IsString()
  segmentId: string;

  @IsString()
  field: string;

  @IsEnum(Operator)
  operator: Operator;

  @IsOptional()
  @IsBoolean()
  not?: boolean;

  value: any;
}
