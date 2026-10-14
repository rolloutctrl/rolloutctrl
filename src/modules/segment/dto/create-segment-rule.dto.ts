import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { Operator } from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'US', description: 'Value to compare against' })
  value: any;

  @ApiPropertyOptional({ minimum: 0, description: 'Rule priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}
