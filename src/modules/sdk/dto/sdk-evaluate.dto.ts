import { MetricType } from 'src/common/generated/prisma/enums';

export interface SdkEvaluationDto {
  type: MetricType;
  count: number;
  featureFlagEnvironmentId: string;
  featureFlagId?: string;
  strategyId?: string;
  variantId?: string;
}

export interface SdkEvaluationBatchDto {
  evaluations: SdkEvaluationDto[];
}
