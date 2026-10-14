import { MetricType } from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IncrementMetricDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  projectId: string;

  @ApiProperty({ example: 'env_123', description: 'Environment ID' })
  environmentId: string;

  @ApiPropertyOptional({ example: 'flag_123', description: 'Feature flag ID' })
  flagId?: string;

  @ApiPropertyOptional({ example: 'strat_123', description: 'Strategy ID' })
  strategyId?: string;

  @ApiPropertyOptional({ example: 'var_123', description: 'Variant ID' })
  variantId?: string;

  @ApiProperty({ enum: Object.values(MetricType), description: 'Metric type' })
  type: MetricType;

  @ApiProperty({ example: 1, description: 'Count to increment' })
  count: number;
}
