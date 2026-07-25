import { MetricType } from 'src/common/generated/prisma/enums';

export interface IncrementMetricDto {
  projectId: string;
  environmentId: string;
  flagId?: string;
  strategyId?: string;
  variantId?: string;
  type: MetricType;
  count: number;
}
