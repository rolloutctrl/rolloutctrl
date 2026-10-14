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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSegmentRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({
    example: 'us-users',
    minLength: 2,
    maxLength: 100,
    description: 'Segment key',
  })
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9.-]+$/)
  key: string;

  @ApiProperty({
    example: 'US Users',
    minLength: 2,
    maxLength: 100,
    description: 'Segment name',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'Segment description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    type: 'array',
    description: 'Segment rules',
  })
  @IsArray()
  rules: CreateSegmentRuleRequestDto[];
}

export class CreateSegmentRuleRequestDto {
  @ApiProperty({ example: 'seg_123', description: 'Segment ID' })
  @IsString()
  segmentId: string;

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
  @IsOptional()
  @IsBoolean()
  not?: boolean;

  @ApiProperty({ example: 'US', description: 'Value to compare against' })
  value: any;
}
