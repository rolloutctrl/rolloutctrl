import { MetricType } from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SdkEvaluationDto {
  @ApiProperty({ enum: Object.values(MetricType), description: 'Metric type' })
  type: MetricType;

  @ApiProperty({ example: 1, description: 'Count' })
  count: number;

  @ApiProperty({
    example: 'ffe_123',
    description: 'Feature flag environment ID',
  })
  featureFlagEnvironmentId: string;

  @ApiPropertyOptional({ example: 'flag_123', description: 'Feature flag ID' })
  featureFlagId?: string;

  @ApiPropertyOptional({ example: 'strat_123', description: 'Strategy ID' })
  strategyId?: string;

  @ApiPropertyOptional({ example: 'var_123', description: 'Variant ID' })
  variantId?: string;
}

export class SdkEvaluationBatchDto {
  @ApiProperty({
    type: 'array',
    description: 'Array of evaluation events',
  })
  evaluations: SdkEvaluationDto[];
}
