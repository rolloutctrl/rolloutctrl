import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  FeatureFlag,
  FeatureFlagEnvironment,
  ResourceType,
  User,
} from 'src/common/generated/prisma/client';
import {
  NotificationType,
  NotificationSeverity,
} from 'src/common/generated/prisma/enums';
import {
  CreateFeatureFlagRequestDto,
  UpdateFeatureFlagRequestDto,
  SingleFlagDto,
} from './dto';
import { evaluateRule } from '../access/access.utils';
import { hashCode } from 'src/common/utils/utils';
import { RuleValue } from 'src/common/types/common';
import { AccessService } from '../access/access.service';
import { ToggleFeatureFlagRequestDto } from './dto/toggle-flag.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditMetadata } from '../audit-log/lib';
import { EnvironmentService } from '../environment/environment.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FeatureFlagService {
  constructor(
    private prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly auditLogService: AuditLogService,
    private readonly environmentService: EnvironmentService,
    private readonly notificationService: NotificationService,
  ) {}

  async createFeatureFlag(
    currentUser: User,
    projectId: string,
    dto: CreateFeatureFlagRequestDto,
  ): Promise<FeatureFlag> {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      include: {
        environments: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existingFlag = await this.prisma.featureFlag.findUnique({
      where: {
        projectId_key: {
          projectId: project.id,
          key: dto.key,
        },
      },
    });

    if (existingFlag) {
      throw new ConflictException(
        `Feature flag with key '${dto.key}' already exists in this project`,
      );
    }

    const featureFlag = await this.prisma.$transaction(async (prisma) => {
      const flag = await prisma.featureFlag.create({
        data: {
          projectId: project.id,
          key: dto.key,
          description: dto.description,
          archived: false,
          createdByEmail: currentUser.email,
          createdById: currentUser.id,
          createdByName: currentUser.name,
        },
      });
      if (project.environments.length > 0) {
        await prisma.featureFlagEnvironment.createMany({
          data: project.environments.map((env) => ({
            featureFlagId: flag.id,
            environmentId: env.id,
            enabled: false,
          })),
        });
      }

      await this.auditLogService.logAction({
        organizationId: project.organizationId,
        projectId: project.id,
        userId: currentUser.id,
        action: AuditAction.CREATE,
        resourceType: ResourceType.FLAG,
        resourceId: flag.id,
        resourceName: flag.key,
        metadata: AuditMetadata.build()
          .withFlag({
            id: flag.id,
            name: flag.key,
          })
          .toJSON(),
      });

      return flag;
    });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }

    return this.prisma.featureFlag.findUnique({
      where: { id: featureFlag.id },
      include: {
        environments: {
          include: {
            strategies: {
              include: {
                segments: true,
                rules: true,
              },
            },
            environment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }) as Promise<FeatureFlag>;
  }

  async createMultipleFeatureFlags(
    currentUser: User,
    projectId: string,
    flags: SingleFlagDto[],
  ): Promise<FeatureFlag[]> {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      include: {
        environments: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const keys = flags.map((f) => f.key);
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) {
      throw new ConflictException('Duplicate keys found in the request');
    }

    const existingFlags = await this.prisma.featureFlag.findMany({
      where: {
        projectId: project.id,
        key: {
          in: keys,
        },
      },
    });

    if (existingFlags.length > 0) {
      const existingKeys = existingFlags.map((f) => f.key).join(', ');
      throw new ConflictException(
        `Feature flags with keys '${existingKeys}' already exist in this project`,
      );
    }

    const createdFlags = await this.prisma.$transaction(async (prisma) => {
      const created: FeatureFlag[] = [];

      for (const flagData of flags) {
        const flag = await prisma.featureFlag.create({
          data: {
            projectId: project.id,
            key: flagData.key,
            description: flagData.description,
            archived: false,
            createdByEmail: currentUser.email,
            createdById: currentUser.id,
            createdByName: currentUser.name,
          },
        });

        if (project.environments.length > 0) {
          await prisma.featureFlagEnvironment.createMany({
            data: project.environments.map((env) => ({
              featureFlagId: flag.id,
              environmentId: env.id,
              enabled: false,
            })),
          });
        }

        created.push(flag);
      }

      return created;
    });

    return this.prisma.featureFlag.findMany({
      where: {
        id: {
          in: createdFlags.map((f) => f.id),
        },
      },
      include: {
        environments: {
          include: {
            environment: true,
            strategies: {
              orderBy: {
                priority: 'desc',
              },
              include: {
                segments: true,
                rules: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async toggleFlagFavorite(flagId: string, enabled: boolean) {
    const currentFlag = await this.prisma.featureFlag.findUnique({
      where: {
        id: flagId,
      },
    });

    if (!currentFlag) {
      throw new NotFoundException('Feature flag not found');
    }

    return this.prisma.featureFlag.update({
      where: {
        id: flagId,
      },
      data: {
        isFavorite: enabled,
      },
    });
  }

  async findAllFeatureFlags(
    projectId: string,
    includeArchived: boolean = false,
    cursor?: string,
    limit: number = 20,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const flags = await this.prisma.featureFlag.findMany({
      where: {
        OR: [{ projectId: project.id }, { project: { slug: project.slug } }],
        archived: includeArchived ? true : false,
      },
      include: {
        environments: {
          include: {
            environment: true,
            strategies: {
              orderBy: {
                priority: 'desc',
              },
              include: {
                segments: true,
                rules: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const lastFlag = flags[flags.length - 1];
    const nextCursor = lastFlag?.id ?? null;

    return {
      data: flags,
      nextCursor,
      hasMore: flags.length === limit,
    };
  }

  async findFeatureFlagById(flagId: string, projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        OR: [{ id: flagId }, { key: flagId }],
        projectId: project.id,
      },
      include: {
        environments: {
          include: {
            environment: true,
            strategies: {
              where: { isArchived: false },
              orderBy: {
                priority: 'desc',
              },
              include: {
                segments: {
                  include: {
                    rules: true,
                  },
                },
                rules: true,
                strategyVariants: {
                  where: { isArchived: false },
                  include: {
                    variant: true,
                  },
                },
              },
            },
          },
        },
        variants: {
          where: { isArchived: false },
        },
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    return flag;
  }

  async updateFeatureFlag(
    flagId: string,
    projectId: string,
    dto: UpdateFeatureFlagRequestDto,
  ): Promise<FeatureFlag> {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
    });

    const environments = await this.prisma.environment.findMany({
      where: {
        projectId: project.id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        id: flagId,
        projectId: project.id,
      },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    if (dto.key && dto.key !== flag.key) {
      const existingFlag = await this.prisma.featureFlag.findUnique({
        where: {
          projectId_key: {
            projectId: project.id,
            key: dto.key,
          },
        },
      });

      if (existingFlag) {
        throw new ConflictException(
          `Feature flag with key '${dto.key}' already exists in this project`,
        );
      }
    }

    const updatedFlag = await this.prisma.featureFlag.update({
      where: { id: flagId },
      data: {
        key: dto.key,
        description: dto.description,
        archived: dto.archived,
      },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    for (const environment of environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }

    await this.accessService.invalidateCacheByProject(project.id);

    return updatedFlag;
  }

  async archiveFeatureFlag(flagId: string, projectId: string) {
    return this.updateFeatureFlag(flagId, projectId, {
      archived: true,
      projectId,
    });
  }

  async restoreFeatureFlag(flagId: string, projectId: string) {
    return this.updateFeatureFlag(flagId, projectId, {
      archived: false,
      projectId,
    });
  }

  async deleteFeatureFlag(
    currentUser: User,
    flagId: string,
    projectId: string,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        id: flagId,
        projectId: project.id,
      },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    const environments = await this.prisma.environment.findMany({
      where: {
        projectId: project.id,
      },
    });

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.FLAG,
      resourceId: flag.id,
      resourceName: flag.key,
      metadata: AuditMetadata.build()
        .withFlag({
          id: flag.id,
          name: flag.key,
        })
        .toJSON(),
    });

    const deletedFlag = await this.prisma.featureFlag.delete({
      where: { id: flagId },
    });

    for (const environment of environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }

    return deletedFlag;
  }

  async configureFlagForEnvironment(
    currentUser: User,
    dto: ToggleFeatureFlagRequestDto,
  ): Promise<FeatureFlagEnvironment> {
    const { projectId, flagId, environmentId, enabled } = dto;
    const project = await this.getProjectByIdOrSlug(projectId);
    const flag = await this.prisma.featureFlag.findUnique({
      where: {
        id: flagId,
        projectId: project.id,
      },
      include: {
        project: true,
      },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    const updatedFeatureFlagEnvironment =
      await this.prisma.featureFlagEnvironment.upsert({
        where: {
          featureFlagId_environmentId: {
            featureFlagId: flagId,
            environmentId,
          },
        },
        update: {
          enabled,
        },
        create: {
          featureFlagId: flagId,
          environmentId,
          enabled,
        },
        include: {
          featureFlag: {
            include: {
              project: {
                select: {
                  id: true,
                  slug: true,
                },
              },
            },
          },
          environment: true,
        },
      });

    await this.environmentService.incrementEnvironmentVersion(environment.id);

    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: enabled ? AuditAction.ENABLE : AuditAction.DISABLE,
      resourceType: ResourceType.FLAG,
      resourceId: updatedFeatureFlagEnvironment.featureFlagId,
      resourceName: updatedFeatureFlagEnvironment.featureFlag.key,
      metadata: AuditMetadata.build()
        .withFlag({
          id: updatedFeatureFlagEnvironment.featureFlagId,
          name: updatedFeatureFlagEnvironment.featureFlag.key,
        })
        .withEnvironment({
          id: environment.id,
          name: environment.name,
        })
        .withChanges([
          {
            field: 'enabled',
            before: !enabled,
            after: enabled,
          },
        ])
        .toJSON(),
    });

    if (
      environment.name.toLowerCase() === 'production' &&
      project.organizationId
    ) {
      await this.notificationService.notifyOrganizationOwnersAndAdmins(
        project.organizationId,
        {
          type: NotificationType.FEATURE_FLAG,
          severity: enabled
            ? NotificationSeverity.SUCCESS
            : NotificationSeverity.WARNING,
          title: `Feature flag "${flag.key}" ${enabled ? 'enabled' : 'disabled'} in production`,
          message: `Feature flag "${flag.key}" was ${enabled ? 'enabled' : 'disabled'} in the production environment by ${currentUser.name ?? currentUser.email}.`,
          actorUserId: currentUser.id,
          entityType: 'FLAG',
          entityId: flag.id,
          link: `/project/${project.slug}/feature-flags/${flag.key}`,
        },
      );
    }

    return updatedFeatureFlagEnvironment;
  }

  async getFlagEnvironmentConfig(flagId: string, environmentId: string) {
    const config = await this.prisma.featureFlagEnvironment.findUnique({
      where: {
        featureFlagId_environmentId: {
          featureFlagId: flagId,
          environmentId,
        },
      },
      include: {
        strategies: {
          orderBy: {
            priority: 'desc',
          },
          include: {
            segments: true,
            rules: true,
          },
        },
        environment: true,
        featureFlag: true,
      },
    });

    if (!config) {
      throw new NotFoundException(
        'Feature flag environment configuration not found',
      );
    }

    return config;
  }

  async getAllEnvironmentsConfig(flagId: string, projectId: string) {
    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        id: flagId,
        projectId,
      },
      include: {
        environments: {
          include: {
            environment: true,
            strategies: {
              orderBy: {
                priority: 'desc',
              },
              include: {
                segments: true,
                rules: true,
              },
            },
          },
        },
      },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    return flag.environments;
  }

  async evaluateFlag(
    flagKey: string,
    environmentId: string,
    context: Record<string, any>,
  ): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        key: flagKey,
        archived: false,
      },
      include: {
        environments: {
          where: {
            environmentId,
          },
          include: {
            strategies: {
              orderBy: {
                priority: 'desc',
              },
              include: {
                segments: true,
                rules: true,
              },
            },
          },
        },
      },
    });

    if (!flag) {
      return false;
    }

    const flagEnv = flag.environments[0];
    if (!flagEnv) {
      return false;
    }

    if (!flagEnv.enabled) {
      return false;
    }

    if (flagEnv.strategies.length === 0) {
      return flagEnv.enabled;
    }

    for (const strategy of flagEnv.strategies) {
      if (
        strategy.rolloutPercentage !== null &&
        strategy.rolloutPercentage !== undefined
      ) {
        const userId = String(context.userId || context.id || '');
        const hash = hashCode(userId);
        const percentage = Math.abs(hash % 100);
        if (percentage >= strategy.rolloutPercentage) {
          continue;
        }
      }

      let allRulesMatch = true;
      for (const rule of strategy.rules) {
        const ruleInput = { ...rule, value: rule.value as RuleValue };
        if (!evaluateRule(ruleInput, context)) {
          allRulesMatch = false;
          break;
        }
      }

      if (allRulesMatch && strategy.rules.length > 0) {
        return true;
      }
    }

    return false;
  }

  async syncFeatureFlagsWithNewEnvironment(
    environmentId: string,
    projectId: string,
  ) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId, projectId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    const featureFlags = await this.prisma.featureFlag.findMany({
      where: { projectId, archived: false },
    });

    if (featureFlags.length === 0) {
      return { created: 0 };
    }

    const result = await this.prisma.featureFlagEnvironment.createMany({
      data: featureFlags.map((flag) => ({
        featureFlagId: flag.id,
        environmentId: environment.id,
        enabled: false,
      })),
      skipDuplicates: true,
    });

    return {
      created: result.count,
      total: featureFlags.length,
    };
  }

  async getProjectByIdOrSlug(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
