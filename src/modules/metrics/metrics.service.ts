import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IncrementMetricDto } from './dto/increment-metric.dto';
import { MetricType } from 'src/common/generated/prisma/enums';

export const METRICS_QUEUE = 'metrics';
export const METRICS_INCREMENT_JOB = 'increment';

@Injectable()
export class MetricsService {
  constructor(
    @InjectQueue(METRICS_QUEUE) private readonly metricsQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async increment(params: Omit<IncrementMetricDto, 'count'>): Promise<void> {
    await this.incrementBy({ ...params, count: 1 });
  }

  async incrementBy(params: IncrementMetricDto): Promise<void> {
    await this.metricsQueue.add(METRICS_INCREMENT_JOB, params);
  }

  async getFlagMetrics(
    flagId: string,
    from: Date,
    to: Date,
    environmentId?: string,
  ) {
    const buckets = await this.prisma.metricsBucket.findMany({
      where: {
        featureFlagId: flagId,
        ...(environmentId ? { featureFlagEnvironmentId: environmentId } : {}),
        type: MetricType.FLAG_EXPOSURE,
        bucketDate: { gte: from, lte: to },
      },
      include: {
        featureFlagEnvironment: {
          include: { environment: true },
        },
      },
    });

    let exposures = 0;

    const timelineMap = new Map<string, { exposures: number }>();

    const envMap = new Map<
      string,
      {
        environmentId: string;
        environmentName: string;
        exposures: number;
      }
    >();

    for (const bucket of buckets) {
      const dateStr = bucket.bucketDate.toISOString().split('T')[0];

      let day = timelineMap.get(dateStr);
      if (!day) {
        day = { exposures: 0 };
        timelineMap.set(dateStr, day);
      }

      const envId = bucket.featureFlagEnvironmentId;
      const envName =
        (bucket.featureFlagEnvironment as any)?.environment?.name ?? envId;

      let envEntry = envMap.get(envId);
      if (!envEntry) {
        envEntry = {
          environmentId: envId,
          environmentName: envName,
          exposures: 0,
        };
        envMap.set(envId, envEntry);
      }

      exposures += bucket.count;
      day.exposures += bucket.count;
      envEntry.exposures += bucket.count;
    }

    const timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    const byEnvironment = Array.from(envMap.values());

    return { exposures, timeline, byEnvironment };
  }

  async getStrategyMetrics(flagId: string, environmentId?: string) {
    const buckets = await this.prisma.metricsBucket.findMany({
      where: {
        featureFlagId: flagId,
        ...(environmentId ? { featureFlagEnvironmentId: environmentId } : {}),
        type: MetricType.STRATEGY_MATCH,
        strategyId: { not: null },
      },
      include: {
        strategy: true,
        featureFlagEnvironment: {
          include: { environment: true },
        },
      },
    });

    const strategyMap = new Map<
      string,
      {
        matches: number;
        strategyName: string | null;
        environment: string | null;
      }
    >();

    for (const bucket of buckets) {
      if (!bucket.strategyId) continue;

      const existing = strategyMap.get(bucket.strategyId);
      strategyMap.set(bucket.strategyId, {
        matches: (existing?.matches ?? 0) + bucket.count,
        strategyName: existing?.strategyName ?? bucket.strategy?.name ?? null,
        environment:
          existing?.environment ??
          (bucket.featureFlagEnvironment as any)?.environment?.name ??
          null,
      });
    }

    return Array.from(strategyMap.entries()).map(
      ([strategyId, { matches, strategyName, environment }]) => ({
        strategyId,
        strategyName,
        environment,
        matches,
      }),
    );
  }

  async getVariantMetrics(flagId: string, environmentId?: string) {
    const buckets = await this.prisma.metricsBucket.findMany({
      where: {
        featureFlagId: flagId,
        ...(environmentId ? { featureFlagEnvironmentId: environmentId } : {}),
        type: MetricType.VARIANT_EXPOSURE,
        variantId: { not: null },
      },
      include: { variant: true },
    });

    const variantMap = new Map<
      string,
      { exposures: number; name: string | null }
    >();
    for (const bucket of buckets) {
      if (!bucket.variantId) continue;
      const existing = variantMap.get(bucket.variantId);
      variantMap.set(bucket.variantId, {
        exposures: (existing?.exposures ?? 0) + bucket.count,
        name: existing?.name ?? bucket.variant?.name ?? null,
      });
    }

    return Array.from(variantMap.entries()).map(
      ([variantId, { exposures, name }]) => ({
        variantId,
        variantName: name,
        exposures,
      }),
    );
  }
}
