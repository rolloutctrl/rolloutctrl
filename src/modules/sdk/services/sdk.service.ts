import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { MetricsService } from '../../metrics/metrics.service';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import { SdkEvaluationDto } from '../dto/sdk-evaluate.dto';

export const SDK_CACHE_PREFIX = 'sdk-config:';

@Injectable()
export class SdkService {
  private readonly logger = new Logger(SdkService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly metricsService: MetricsService,
  ) {}

  async getConfig(
    apiKeyRecord: { projectId: string },
    environmentName: string,
  ) {
    const env = await this.resolveEnvironment(
      apiKeyRecord.projectId,
      environmentName,
    );
    const cacheKey = `${SDK_CACHE_PREFIX}${env.id}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`SDK cache hit for environment ${env.id}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(
        `SDK Redis read failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.logger.debug(`SDK cache miss for environment ${env.id}`);
    const config = await this.buildConfig(env.id);

    try {
      await this.redis.set(cacheKey, JSON.stringify(config));
    } catch (error) {
      this.logger.warn(
        `SDK Redis write failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return config;
  }

  async getConfigChanges(
    apiKeyRecord: { projectId: string },
    environmentName: string,
    since: number,
  ) {
    const env = await this.resolveEnvironment(
      apiKeyRecord.projectId,
      environmentName,
    );
    const cacheKey = `${SDK_CACHE_PREFIX}${env.id}`;

    let version: number = env.version;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { version: number };
        version = parsed.version;
      }
    } catch {
      // fall back to DB version already set above
    }

    return {
      version,
      hasChanges: version !== since,
    };
  }

  async trackEvaluations(
    projectId: string,
    evaluations: SdkEvaluationDto[],
  ): Promise<void> {
    await Promise.all(
      evaluations.map((evaluation) =>
        this.metricsService.incrementBy({
          projectId,
          environmentId: evaluation.featureFlagEnvironmentId,
          flagId: evaluation.featureFlagId,
          strategyId: evaluation.strategyId,
          variantId: evaluation.variantId,
          type: evaluation.type,
          count: evaluation.count,
        }),
      ),
    );
  }

  async invalidateSdkConfig(environmentId: string): Promise<void> {
    const cacheKey = `${SDK_CACHE_PREFIX}${environmentId}`;
    try {
      await this.redis.del(cacheKey);
      this.logger.debug(
        `SDK cache invalidated for environment ${environmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate SDK cache for environment ${environmentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async invalidateSdkConfigByProject(projectId: string): Promise<void> {
    try {
      const environments = await this.prisma.environment.findMany({
        where: { projectId },
        select: { id: true },
      });
      await Promise.all(
        environments.map((env) => this.invalidateSdkConfig(env.id)),
      );
      this.logger.log(
        `SDK cache invalidated for ${environments.length} environments in project ${projectId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate SDK cache for project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async resolveEnvironment(projectId: string, environmentName: string) {
    const env = await this.prisma.environment.findFirst({
      where: { projectId, name: environmentName },
      select: { id: true, name: true, version: true, projectId: true },
    });

    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    return env;
  }

  private async buildConfig(environmentId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
      include: {
        project: {
          include: {
            actions: {
              include: {
                strategies: {
                  include: {
                    segments: { include: { rules: true } },
                    rules: true,
                  },
                },
              },
            },
          },
        },
        featureFlags: {
          include: {
            strategies: {
              where: { isArchived: false },
              include: {
                segments: {
                  where: { isArchived: false },
                  include: {
                    rules: { orderBy: { priority: 'desc' } },
                  },
                },
                rules: true,
                strategyVariants: {
                  include: {
                    variant: true,
                  },
                },
              },
            },
            featureFlag: {
              include: {
                variants: {
                  where: { isArchived: false },
                },
              },
            },
          },
        },
      },
    });

    if (!env) throw new NotFoundException('Environment not found');

    return {
      environment: env.name,
      version: env.version,
      project: env.project,
      flags: this.buildFlagsMap(env.featureFlags),
      actions: this.buildActionsMap(env.project.actions),
    };
  }

  private buildFlagsMap(flags: any[]): Record<string, any> {
    const map: Record<string, any> = {};

    for (const flag of flags) {
      const key = flag.featureFlag?.key ?? flag.key;
      if (!key) continue;

      const strategies = (flag.strategies ?? []).map((s: any) => ({
        id: s.id,
        flagKey: key,
        name: s.name,
        enabled: s.enabled,
        priority: s.priority,
        matchType: s.matchType,
        rolloutPercentage: s.rolloutPercentage,
        rolloutStickinessField: s.rolloutStickinessField,
        timezone: s.timezone,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        segments: (s.segments ?? []).map((seg: any) => ({
          id: seg.id,
          key: seg.key,
          rules: (seg.rules ?? []).map((r: any) => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
            not: r.not,
            priority: r.priority ?? 0,
          })),
        })),
        rules: (s.rules ?? []).map((r: any) => ({
          id: r.id,
          field: r.field,
          operator: r.operator,
          value: r.value,
          not: r.not,
        })),
        // strategyVariants: (s.strategyVariants ?? []).map((sv: any) => ({
        //   id: sv.id,
        //   weight: sv.weight,
        //   variant: {
        //     id: sv.variant.id,
        //     name: sv.variant.name,
        //     payload:
        //       sv.variant.payloadType === VariantPayloadType.JSON
        //         ? JSON.parse(sv.variant.payload)
        //         : sv.variant.payload,
        //     payloadType: sv.variant.payloadType,
        //   },
        // })),
        strategyVariants: (s.strategyVariants ?? [])
          .filter((sv: any) => !sv.isArchived && !sv.variant?.isArchived)
          .map((sv: any) => ({
            id: sv.id,
            weight: sv.weight,
            variant: {
              id: sv.variant.id,
              name: sv.variant.name,
              payload:
                sv.variant.payloadType === VariantPayloadType.JSON
                  ? JSON.parse(sv.variant.payload)
                  : sv.variant.payload,
              payloadType: sv.variant.payloadType,
            },
          })),
      }));

      map[key] = {
        _featureFlagEnvironmentId: flag.id,
        _featureFlagId: flag.featureFlag?.id,
        enabled: flag.enabled,
        strategies,
      };
    }

    return map;
  }

  private buildActionsMap(actions: any[]): Record<string, any> {
    const map: Record<string, any> = {};

    for (const action of actions) {
      const key = action.key;
      if (!key) continue;

      const strategies = (action.strategies ?? []).map((s: any) => ({
        id: s.id,
        enabled: s.enabled,
        priority: s.priority,
        effect: s.effect,
        matchType: s.matchType,
        segments: (s.segments ?? []).map((seg: any) => ({
          id: seg.id,
          key: seg.key,
          rules: (seg.rules ?? []).map((r: any) => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
            not: r.not,
            priority: r.priority ?? 0,
          })),
        })),
        rules: (s.rules ?? []).map((r: any) => ({
          field: r.field,
          operator: r.operator,
          value: r.value,
          not: r.not,
        })),
      }));

      map[key] = {
        id: action.id,
        key: action.key,
        enabled: action.enabled,
        defaultEffect: action.defaultEffect,
        strategies,
      };
    }

    return map;
  }
}
