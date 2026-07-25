import type { MetricsBucket } from './model/types';
import { useGetFlagMetrics } from './api/useGetFlagMetrics';
import { useGetFlagStrategyMetrics } from './api/useGetFlagStrategyMetrics';
import { useGetFlagVariantsMetrics } from './api/useGetFlagVariantsMetrics';

export type { MetricsBucket };
export {
  useGetFlagMetrics,
  useGetFlagStrategyMetrics,
  useGetFlagVariantsMetrics,
};
