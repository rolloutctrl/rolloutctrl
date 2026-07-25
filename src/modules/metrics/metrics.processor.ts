import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IncrementMetricDto } from './dto/increment-metric.dto';
import { METRICS_QUEUE, METRICS_INCREMENT_JOB } from './metrics.service';

function getBucketDate(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

@Processor(METRICS_QUEUE)
export class MetricsProcessor extends WorkerHost {
  private readonly logger = new Logger(MetricsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<IncrementMetricDto>): Promise<void> {
    if (job.name !== METRICS_INCREMENT_JOB) return;

    const {
      projectId,
      environmentId,
      flagId,
      strategyId,
      variantId,
      type,
      count,
    } = job.data;
    const bucketDate = getBucketDate(new Date());

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.metricsBucket.findFirst({
        where: {
          type,
          featureFlagEnvironmentId: environmentId,
          featureFlagId: flagId ?? null,
          strategyId: strategyId ?? null,
          variantId: variantId ?? null,
          bucketDate,
        },
        select: { id: true },
      });

      if (existing) {
        await tx.metricsBucket.update({
          where: { id: existing.id },
          data: { count: { increment: count } },
        });
      } else {
        await tx.metricsBucket.create({
          data: {
            projectId,
            featureFlagEnvironmentId: environmentId,
            featureFlagId: flagId,
            strategyId,
            variantId,
            type,
            count,
            bucketDate,
          },
        });
      }
    });
  }
}
