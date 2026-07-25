import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import {
  CanInput,
  CanResult,
  EvaluateFlagInput,
  EvaluateFlagResult,
} from './access.types';
import {
  evaluateAction,
  evaluateFeatureFlag,
  EvaluationReason,
  type Action,
  type EvaluationContext,
  type EvaluationActionContext,
} from '@rolloutctrl/evaluator';
import { PrismaService } from '../prisma/prisma.service';
import { SDK_CACHE_PREFIX } from '../sdk/services/sdk.service';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class AccessService {
  private readonly logger = new Logger(AccessService.name);
  private readonly CACHE_TTL = 3600;
  private readonly CACHE_PREFIX = 'access:config:';

  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async can(input: CanInput): Promise<CanResult> {
    const { action, environment, projectId } = input;

    const config = await this.getConfig(projectId, environment);

    const actionConfig = config.actions[action];

    if (!actionConfig) {
      return { allowed: false, reason: ['ACTION_NOT_FOUND'] };
    }

    const context: EvaluationActionContext = {
      ...input.attributes,
      userId: input.userId,
    };

    const result = evaluateAction(actionConfig, context);

    return {
      allowed: result.effect === 'ALLOW',
      reason: result.strategyId
        ? [`STRATEGY_MATCH:${result.strategyId}`]
        : ['DEFAULT_EFFECT'],
    };
  }

  async evaluateFlag(input: EvaluateFlagInput): Promise<EvaluateFlagResult> {
    const { flagKey, environment, attributes, userId, kind, key, projectId } =
      input;

    const config = await this.getConfig(projectId, environment);

    const flag = config.flags[flagKey];

    if (!flag) {
      return { enabled: false, reason: 'FLAG_NOT_FOUND' };
    }

    const context: EvaluationContext = {
      ...attributes,
      userId,
      kind: kind ?? 'user',
      key: key ?? userId ?? '',
    };

    const result = evaluateFeatureFlag(flag, context);

    if (!result.enabled) {
      return {
        enabled: false,
        reason:
          result.reason === EvaluationReason.DISABLED_FLAG
            ? 'FLAG_DISABLED'
            : 'NO_STRATEGY_MATCH',
      };
    }

    if (result.reason === EvaluationReason.NO_STRATEGIES) {
      return { enabled: true, reason: 'NO_STRATEGIES' };
    }

    if (result.variant) {
      return {
        enabled: true,
        reason: `VARIANT_ASSIGNED:${result.strategy?.id}:${result.variant.id}`,
        strategy: result.strategy,
        variant: result.variant,
      };
    }

    return {
      enabled: true,
      reason: `STRATEGY_MATCH:${result.strategy?.id}`,
      strategy: result.strategy,
    };
  }

  async resolveProjectIdFromApiKey(apiKey: string): Promise<string> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new BadRequestException('Missing API key');
    }
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const record = await this.prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
      select: { projectId: true },
    });
    if (!record) throw new UnauthorizedException('Invalid API key');
    return record.projectId;
  }

  private async getConfig(projectId: string, environmentName: string) {
    if (!projectId || projectId.trim().length === 0) {
      throw new BadRequestException('Missing projectId');
    }
    if (!environmentName || environmentName.trim().length === 0) {
      throw new BadRequestException('Missing environment');
    }

    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: projectId }, { slug: projectId }] },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const cacheKey = `${this.CACHE_PREFIX}${project.id}:${environmentName}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${project.id}:${environmentName}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(
        `Redis cache read failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.logger.debug(`Cache miss for ${project.id}:${environmentName}`);

    const env = await this.prisma.environment.findFirst({
      where: { name: environmentName, projectId: project.id },
      include: {
        project: {
          include: {
            actions: {
              include: {
                strategies: {
                  include: {
                    segments: {
                      include: {
                        rules: true,
                      },
                    },
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
              include: {
                segments: {
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
                variants: true,
              },
            },
            environment: true,
          },
        },
      },
    });

    if (!env) throw new NotFoundException('Environment not found');

    const config = {
      project: env.project,
      flags: this.buildFlagsMap(env.featureFlags),
      actions: this.buildActionsMap(env.project.actions),
    };

    try {
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(config));
      this.logger.debug(`Cached config for environment: ${environmentName}`);
    } catch (error) {
      this.logger.warn(
        `Redis cache write failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return config;
  }

  private buildFlagsMap(flags: any[]) {
    const map: Record<string, any> = {};

    for (const flag of flags) {
      const key = flag.featureFlag?.key ?? flag.key;
      if (!key) continue;

      const strategies = (flag.strategies ?? [])
        .filter((s: any) => !s.isArchived)
        .map((s: any) => ({
          id: s.id,
          flagKey: key,
          name: s.name,
          isDefault: s.isDefault ?? false,
          enabled: s.enabled,
          priority: s.priority,
          matchType: s.matchType,
          rolloutPercentage: s.rolloutPercentage,
          rolloutStickinessField: s.rolloutStickinessField,
          timezone: s.timezone,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          segments: (s.segments ?? [])
            .filter((seg: any) => !seg.isArchived)
            .map((seg: any) => ({
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

  private buildActionsMap(actions: any[]): Record<string, Action> {
    const map: Record<string, Action> = {};

    for (const action of actions) {
      const key = action.key;
      if (!key) continue;

      const strategies = (action.strategies ?? [])
        .filter((s: any) => !s.isArchived)
        .map((s: any) => ({
          id: s.id,
          enabled: s.enabled,
          priority: s.priority,
          effect: s.effect,
          matchType: s.matchType,
          segments: (s.segments ?? [])
            .filter((seg: any) => !seg.isArchived)
            .map((seg: any) => ({
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

  async invalidateCache(
    projectId: string,
    environmentName: string,
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${projectId}:${environmentName}`;
    try {
      await this.redis.del(cacheKey);
      this.logger.log(`Cache invalidated for ${projectId}:${environmentName}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for ${projectId}:${environmentName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cleared ${keys.length} cache entries`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to clear all cache: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async invalidateCacheByProject(projectId: string): Promise<void> {
    try {
      const environments = await this.prisma.environment.findMany({
        where: { projectId },
        select: { id: true, name: true },
      });

      await Promise.all([
        ...environments.map((env) => this.invalidateCache(projectId, env.name)),
        ...environments.map((env) =>
          this.redis
            .del(`${SDK_CACHE_PREFIX}${env.id}`)
            .catch((err: unknown) =>
              this.logger.warn(
                `Failed to delete SDK cache for env ${env.id}: ${
                  err instanceof Error ? err.message : String(err)
                }`,
              ),
            ),
        ),
      ]);

      this.logger.log(
        `Cache invalidated for ${environments.length} environments in project ${projectId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getPublicConfig(apiKey: string, environmentName: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new BadRequestException('Missing apiKey');
    }
    if (!environmentName || environmentName.trim().length === 0) {
      throw new BadRequestException('Missing environment');
    }

    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const env = await this.prisma.environment.findFirst({
      where: {
        name: environmentName,
        project: {
          apiKeys: {
            some: {
              keyHash: apiKeyHash,
              revokedAt: null,
            },
          },
        },
      },
      include: {
        featureFlags: {
          include: {
            strategies: {
              include: {
                segments: {
                  include: {
                    rules: true,
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
                variants: true,
              },
            },
            environment: true,
          },
        },
        project: {
          include: {
            actions: {
              include: {
                strategies: {
                  include: {
                    segments: {
                      include: {
                        rules: true,
                      },
                    },
                    rules: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!env) {
      const keyExists = await this.prisma.apiKey.findFirst({
        where: { keyHash: apiKeyHash, revokedAt: null },
        select: { id: true },
      });

      if (!keyExists) throw new UnauthorizedException('Invalid API key');

      throw new NotFoundException('Environment not found');
    }

    return {
      environment: env.name,
      version: env.version,

      project: env.project,
      flags: this.buildFlagsMap(env.featureFlags),
      actions: this.buildActionsMap(env.project.actions),
    };
  }
}
