import {
  Injectable,
  NotFoundException,
  BadRequestException,
  // ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  Prisma,
  ResourceType,
  Strategy,
  StrategyRule,
  User,
} from 'src/common/generated/prisma/client';
import {
  CreateStrategyRequestDto,
  UpdateStrategyRequestDto,
  CreateStrategyRuleRequestDto,
  UpdateStrategyRuleRequestDto,
  ReorderRulesRequestDto,
  CreateStrategyVariantRequestDto,
  UpdateStrategyVariantRequestDto,
  BatchCreateStrategyVariantsRequestDto,
} from './dto';
import { OperatorConfig } from 'src/common/types/common';
import { OPERATOR_CONFIG } from 'src/common/constants/operator.constants';
import { AccessService } from '../access/access.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditMetadata } from '../audit-log/lib';
import { EnvironmentService } from '../environment/environment.service';

@Injectable()
export class StrategyService {
  constructor(
    private prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly auditLogService: AuditLogService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async createStrategy(
    currentUser: User,
    dto: CreateStrategyRequestDto,
  ): Promise<Strategy[]> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);
    const environments = await this.prisma.featureFlagEnvironment.findMany({
      where: { id: { in: dto.featureFlagEnvironmentIds } },
      include: {
        environment: true,
      },
    });

    if (environments.length !== dto.featureFlagEnvironmentIds.length) {
      throw new NotFoundException(
        'One or more feature flag environments not found',
      );
    }

    if (dto.rolloutPercentage != null && !dto.rolloutStickinessField) {
      throw new BadRequestException(
        'rolloutStickinessField is required when rolloutPercentage is set',
      );
    }

    if (dto.startsAt && !dto.timezone) {
      throw new BadRequestException(
        'Timezone is required when startsAt is set',
      );
    }

    if (dto.endsAt && !dto.timezone) {
      throw new BadRequestException('Timezone is required when endsAt is set');
    }

    if (
      dto.timezone &&
      !Intl.supportedValuesOf('timeZone').includes(dto.timezone)
    ) {
      throw new BadRequestException('Invalid timezone');
    }

    if (dto.isDefault) {
      const existingDefaults = await this.prisma.strategy.findMany({
        where: {
          featureFlagEnvironmentId: { in: dto.featureFlagEnvironmentIds },
          isDefault: true,
        },
        select: { id: true, featureFlagEnvironmentId: true },
      });
      if (existingDefaults.length > 0) {
        throw new BadRequestException(
          'A default strategy already exists in one or more of the specified environments',
        );
      }
    }

    if (dto.segmentIds && dto.segmentIds.length > 0) {
      const segments = await this.prisma.segment.findMany({
        where: { id: { in: dto.segmentIds } },
      });
      if (segments.length !== dto.segmentIds.length) {
        throw new NotFoundException('One or more segments not found');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      type CreatedStrategy = Prisma.StrategyGetPayload<{
        include: {
          segments: true;
          rules: true;
          featureFlagEnvironment: { include: { environment: true } };
        };
      }>;
      const createdStrategies: CreatedStrategy[] = [];

      for (const featureFlagEnvironmentId of dto.featureFlagEnvironmentIds) {
        const maxPriority = await prisma.strategy.aggregate({
          where: { featureFlagEnvironmentId },
          _max: { priority: true },
        });

        const priority = dto.priority ?? (maxPriority._max.priority ?? -1) + 1;

        const strategy = await prisma.strategy.create({
          data: {
            featureFlagEnvironmentId,
            name: dto.name,
            isDefault: dto.isDefault ?? false,
            rolloutPercentage: dto.rolloutPercentage,
            rolloutStickinessField: dto.rolloutStickinessField,
            segments: dto.segmentIds
              ? { connect: dto.segmentIds.map((id) => ({ id })) }
              : undefined,
            priority,
            timezone: dto.timezone,
            startsAt: dto.startsAt,
            endsAt: dto.endsAt,
            rules: dto.rules
              ? {
                  create: dto.rules.map((rule) => ({
                    field: rule.field,
                    operator: rule.operator,
                    value: rule.value,
                    not: rule.not,
                  })),
                }
              : undefined,
          },
          include: {
            segments: true,
            rules: true,
            featureFlagEnvironment: {
              include: {
                environment: true,
              },
            },
          },
        });

        createdStrategies.push(strategy);
      }

      for (const environment of environments) {
        await this.environmentService.incrementEnvironmentVersion(
          environment.environment.id,
        );
      }

      await this.accessService.invalidateCacheByProject(project.id);

      for (const strategy of createdStrategies) {
        await this.auditLogService.logAction({
          organizationId: project.organizationId,
          projectId: project.id,
          userId: currentUser.id,
          action: AuditAction.CREATE,
          resourceType: ResourceType.STRATEGY,
          resourceId: strategy.id,
          metadata: AuditMetadata.build()
            .withStrategy({
              id: strategy.id,
              name: strategy.name,
            })
            .withEnvironment({
              id: strategy.featureFlagEnvironment.environment.id,
              name: strategy.featureFlagEnvironment.environment.name,
            })
            .toJSON(),
        });
      }

      return createdStrategies;
    });
  }

  async findAllStrategies(
    featureFlagEnvironmentId: string,
  ): Promise<Strategy[]> {
    return this.prisma.strategy.findMany({
      where: { featureFlagEnvironmentId },
      orderBy: { priority: 'desc' },
      include: {
        segments: true,
        rules: true,
      },
    });
  }

  async findStrategyById(strategyId: string): Promise<Strategy> {
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        segments: true,
        rules: true,
        featureFlagEnvironment: {
          include: {
            featureFlag: true,
            environment: true,
          },
        },
      },
    });

    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    return strategy;
  }

  async updateStrategy(
    currentUser: User,
    strategyId: string,
    dto: UpdateStrategyRequestDto,
  ): Promise<Strategy> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        segments: true,
        rules: true,
        strategyVariants: { include: { variant: true } },
        featureFlagEnvironment: {
          include: { environment: true },
        },
      },
    });

    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    if (dto.featureFlagEnvironmentIds !== undefined) {
      if (dto.featureFlagEnvironmentIds.length === 0) {
        throw new BadRequestException(
          'featureFlagEnvironmentIds cannot be empty',
        );
      }

      const environments = await this.prisma.featureFlagEnvironment.findMany({
        where: { id: { in: dto.featureFlagEnvironmentIds } },
        include: {
          environment: true,
        },
      });

      if (environments.length !== dto.featureFlagEnvironmentIds.length) {
        throw new NotFoundException(
          'One or more feature flag environments not found',
        );
      }
    }

    if (dto.rolloutPercentage != null && !dto.rolloutStickinessField) {
      throw new BadRequestException(
        'rolloutStickinessField is required when rolloutPercentage is set',
      );
    }

    if (dto.startsAt && !dto.timezone) {
      throw new BadRequestException(
        'Timezone is required when startsAt is set',
      );
    }

    if (dto.endsAt && !dto.timezone) {
      throw new BadRequestException('Timezone is required when endsAt is set');
    }

    if (
      dto.timezone &&
      !Intl.supportedValuesOf('timeZone').includes(dto.timezone)
    ) {
      throw new BadRequestException('Invalid timezone');
    }

    if (dto.segmentIds && dto.segmentIds.length > 0) {
      const segments = await this.prisma.segment.findMany({
        where: { id: { in: dto.segmentIds } },
      });
      if (segments.length !== dto.segmentIds.length) {
        throw new NotFoundException('One or more segments not found');
      }
    }

    if (dto.isDefault) {
      const envIdsToCheck = dto.featureFlagEnvironmentIds ?? [
        strategy.featureFlagEnvironmentId,
      ];
      const existingDefault = await this.prisma.strategy.findFirst({
        where: {
          featureFlagEnvironmentId: { in: envIdsToCheck },
          isDefault: true,
          id: { not: strategyId },
        },
        select: { id: true, featureFlagEnvironmentId: true },
      });
      if (existingDefault) {
        throw new BadRequestException(
          'A default strategy already exists in one or more of the specified environments',
        );
      }
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const currentEnvId = strategy.featureFlagEnvironmentId;
      let targetEnvId = currentEnvId;
      let envsToCreateCopies: string[] = [];

      if (dto.featureFlagEnvironmentIds !== undefined) {
        const isCurrentEnvInList =
          dto.featureFlagEnvironmentIds.includes(currentEnvId);

        if (isCurrentEnvInList) {
          targetEnvId = currentEnvId;
          envsToCreateCopies = dto.featureFlagEnvironmentIds.filter(
            (id) => id !== currentEnvId,
          );
        } else {
          targetEnvId = dto.featureFlagEnvironmentIds[0];
          envsToCreateCopies = dto.featureFlagEnvironmentIds.slice(1);
        }
      }

      if (dto.rules !== undefined) {
        await prisma.strategyRule.deleteMany({ where: { strategyId } });
      }

      const updatedStrategy = await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          featureFlagEnvironmentId: targetEnvId,
          name: dto.name,
          isDefault: dto.isDefault,
          rolloutPercentage: dto.rolloutPercentage,
          rolloutStickinessField: dto.rolloutStickinessField,
          priority: dto.priority,
          timezone: dto.timezone,
          startsAt: dto.startsAt,
          endsAt: dto.endsAt,
          segments:
            dto.segmentIds !== undefined
              ? { set: dto.segmentIds.map((id) => ({ id })) }
              : undefined,
          rules: dto.rules
            ? {
                create: dto.rules.map((rule) => ({
                  field: rule.field,
                  operator: rule.operator,
                  value: rule.value,
                  not: rule.not,
                })),
              }
            : undefined,
        },
        include: {
          segments: true,
          rules: true,
        },
      });

      for (const envId of envsToCreateCopies) {
        const maxPriority = await prisma.strategy.aggregate({
          where: { featureFlagEnvironmentId: envId },
          _max: { priority: true },
        });

        const priority = dto.priority ?? (maxPriority._max.priority ?? -1) + 1;

        const copySegmentIds =
          dto.segmentIds !== undefined
            ? dto.segmentIds
            : strategy.segments.map((s) => s.id);

        const copyRules =
          dto.rules !== undefined
            ? dto.rules.map((rule) => ({
                field: rule.field,
                operator: rule.operator,
                value: rule.value,
                not: rule.not ?? false,
              }))
            : strategy.rules.map((rule) => ({
                field: rule.field,
                operator: rule.operator,
                value: rule.value,
                not: rule.not,
              }));

        const copyStrategyVariants = strategy.strategyVariants.map((sv) => ({
          variantId: sv.variantId,
          weight: sv.weight,
          isCustomWeight: sv.isCustomWeight,
          isArchived: sv.isArchived,
        }));

        await prisma.strategy.create({
          data: {
            featureFlagEnvironmentId: envId,
            name: dto.name ?? strategy.name,
            enabled: strategy.enabled,
            matchType: strategy.matchType,
            isDefault: dto.isDefault ?? strategy.isDefault,
            rolloutPercentage:
              dto.rolloutPercentage ?? strategy.rolloutPercentage,
            rolloutStickinessField:
              dto.rolloutStickinessField ?? strategy.rolloutStickinessField,
            priority,
            timezone: dto.timezone ?? strategy.timezone,
            startsAt: dto.startsAt ?? strategy.startsAt,
            endsAt: dto.endsAt ?? strategy.endsAt,
            segments: { connect: copySegmentIds.map((id) => ({ id })) },
            rules: { create: copyRules },
            strategyVariants: { create: copyStrategyVariants },
          },
        });
      }

      const updatedEnvironments =
        await this.prisma.featureFlagEnvironment.findMany({
          where: { id: { in: dto.featureFlagEnvironmentIds } },
          include: {
            environment: true,
          },
        });

      for (const environment of updatedEnvironments) {
        await this.environmentService.incrementEnvironmentVersion(
          environment.environment.id,
        );
      }
      await this.accessService.invalidateCacheByProject(project.id);

      return updatedStrategy;
    });

    const changes: { field: string; before: unknown; after: unknown }[] = [];

    if (dto.name !== undefined && dto.name !== strategy.name) {
      changes.push({ field: 'name', before: strategy.name, after: dto.name });
    }
    if (dto.isDefault !== undefined && dto.isDefault !== strategy.isDefault) {
      changes.push({
        field: 'isDefault',
        before: strategy.isDefault,
        after: dto.isDefault,
      });
    }
    if (
      dto.rolloutPercentage !== undefined &&
      dto.rolloutPercentage !== strategy.rolloutPercentage
    ) {
      changes.push({
        field: 'rolloutPercentage',
        before: strategy.rolloutPercentage,
        after: dto.rolloutPercentage,
      });
    }
    if (
      dto.rolloutStickinessField !== undefined &&
      dto.rolloutStickinessField !== strategy.rolloutStickinessField
    ) {
      changes.push({
        field: 'rolloutStickinessField',
        before: strategy.rolloutStickinessField,
        after: dto.rolloutStickinessField,
      });
    }
    if (dto.priority !== undefined && dto.priority !== strategy.priority) {
      changes.push({
        field: 'priority',
        before: strategy.priority,
        after: dto.priority,
      });
    }
    if (
      dto.startsAt !== undefined &&
      String(dto.startsAt) !== String(strategy.startsAt)
    ) {
      changes.push({
        field: 'startsAt',
        before: strategy.startsAt,
        after: dto.startsAt,
      });
    }
    if (
      dto.endsAt !== undefined &&
      String(dto.endsAt) !== String(strategy.endsAt)
    ) {
      changes.push({
        field: 'endsAt',
        before: strategy.endsAt,
        after: dto.endsAt,
      });
    }
    if (dto.segmentIds !== undefined) {
      const beforeSegments = strategy.segments.map((s) => s.id).sort();
      const afterSegments = [...dto.segmentIds].sort();
      if (JSON.stringify(beforeSegments) !== JSON.stringify(afterSegments)) {
        changes.push({
          field: 'segments',
          before: strategy.segments.map((s) => s.id),
          after: dto.segmentIds,
        });
      }
    }
    if (dto.rules !== undefined) {
      const beforeRules = strategy.rules.map((r) => ({
        field: r.field,
        operator: r.operator,
        value: r.value,
        not: r.not,
      }));
      const afterRules = dto.rules.map((r) => ({
        field: r.field,
        operator: r.operator,
        value: r.value,
        not: r.not,
      }));
      if (JSON.stringify(beforeRules) !== JSON.stringify(afterRules)) {
        changes.push({
          field: 'rules',
          before: beforeRules,
          after: afterRules,
        });
      }
    }

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.STRATEGY,
      resourceId: strategy.id,
      metadata: AuditMetadata.build()
        .withStrategy({ id: strategy.id, name: strategy.name })
        .withEnvironment({
          id: strategy.featureFlagEnvironment.environment.id,
          name: strategy.featureFlagEnvironment.environment.name,
        })
        .withChanges(changes)
        .toJSON(),
    });

    return result;
  }

  async deleteStrategy(
    currentUser: User,
    strategyId: string,
    projectId: string,
  ): Promise<void> {
    const project = await this.getProjectByIdOrSlug(projectId);
    const strategy = await this.prisma.strategy.findFirst({
      where: {
        id: strategyId,
        featureFlagEnvironment: {
          environment: { project: { id: project.id } },
        },
      },
      include: {
        featureFlagEnvironment: {
          include: {
            environment: {
              include: {
                project: true,
              },
            },
            featureFlag: true,
          },
        },
      },
    });

    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    const environmentId = strategy.featureFlagEnvironment.environment.id;
    const organizationId = project.organizationId;

    await this.prisma.strategy.delete({
      where: { id: strategyId },
    });

    await this.environmentService.incrementEnvironmentVersion(environmentId);
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.STRATEGY,
      resourceId: strategy.id,
      metadata: AuditMetadata.build()
        .withStrategy({
          id: strategy.id,
          name: strategy.name,
        })
        .withFlag({
          id: strategy.featureFlagEnvironment.featureFlag.id,
          name: strategy.featureFlagEnvironment.featureFlag.key,
        })
        .withEnvironment({
          id: strategy.featureFlagEnvironment.environment.id,
          name: strategy.featureFlagEnvironment.environment.name,
        })
        .toJSON(),
    });
  }

  async reorderStrategies(
    featureFlagEnvironmentId: string,
    dto: ReorderRulesRequestDto,
  ): Promise<Strategy[]> {
    await this.prisma.$transaction(
      dto.rules.map((rule, index) =>
        this.prisma.strategy.update({
          where: { id: rule.id },
          data: { priority: dto.rules.length - index },
        }),
      ),
    );

    return this.findAllStrategies(featureFlagEnvironmentId);
  }

  async createStrategyRule(
    dto: CreateStrategyRuleRequestDto,
  ): Promise<StrategyRule> {
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: dto.strategyId },
    });

    if (!strategy) {
      throw new NotFoundException('Strategy not found');
    }

    this.validateRuleFields(dto);

    return this.prisma.strategyRule.create({
      data: {
        strategyId: dto.strategyId,
        field: dto.field,
        operator: dto.operator,
        value: dto.value,
      },
    });
  }

  async updateStrategyRule(
    ruleId: string,
    dto: UpdateStrategyRuleRequestDto,
  ): Promise<StrategyRule> {
    const rule = await this.prisma.strategyRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Strategy rule with ID ${ruleId} not found`);
    }

    if (dto.field || dto.operator || dto.value) {
      this.validateRuleFields(dto as CreateStrategyRuleRequestDto);
    }

    return this.prisma.strategyRule.update({
      where: { id: ruleId },
      data: {
        field: dto.field,
        operator: dto.operator,
        value: dto.value,
      },
    });
  }

  async deleteStrategyRule(ruleId: string): Promise<void> {
    const rule = await this.prisma.strategyRule.findFirst({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Strategy rule with ID ${ruleId} not found`);
    }

    await this.prisma.strategyRule.delete({
      where: { id: ruleId },
    });
  }

  async findAllStrategyRules(strategyId: string): Promise<StrategyRule[]> {
    return this.prisma.strategyRule.findMany({
      where: { strategyId },
    });
  }

  async toggleStrategyEnable(
    strategyId: string,
    currentUser: User,
    enabled: boolean,
    projectId: string,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);
    const currentStrategy = await this.prisma.strategy.findUnique({
      where: {
        id: strategyId,
        featureFlagEnvironment: {
          environment: {
            projectId: project.id,
          },
        },
      },
      include: {
        featureFlagEnvironment: {
          include: {
            environment: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!currentStrategy) {
      throw new NotFoundException('Strategy not found');
    }

    const organizationId =
      currentStrategy.featureFlagEnvironment.environment.project.organizationId;

    const result = await this.prisma.strategy.update({
      where: {
        id: currentStrategy.id,
      },
      data: {
        enabled,
      },
    });

    await this.environmentService.incrementEnvironmentVersion(
      currentStrategy.featureFlagEnvironment.environmentId,
    );
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: enabled ? AuditAction.ENABLE : AuditAction.DISABLE,
      resourceType: ResourceType.STRATEGY,
      resourceId: currentStrategy.id,
      metadata: AuditMetadata.build()
        .withStrategy({
          id: currentStrategy.id,
          name: currentStrategy.name,
        })
        .withEnvironment({
          id: currentStrategy.featureFlagEnvironment.environment.id,
          name: currentStrategy.featureFlagEnvironment.environment.name,
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

    return result;
  }

  // ─── StrategyVariant management ───

  async findAllStrategyVariants(strategyId: string) {
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
    });
    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    return this.prisma.strategyVariant.findMany({
      where: { strategyId },
      include: { variant: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addVariantToStrategy(
    currentUser: User,
    strategyId: string,
    projectId: string,
    dto: CreateStrategyVariantRequestDto,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        strategyVariants: true,
        featureFlagEnvironment: {
          include: { featureFlag: true, environment: true },
        },
      },
    });
    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    const featureFlagId = strategy.featureFlagEnvironment.featureFlagId;

    let variantId: string;

    return this.prisma.$transaction(async (tx) => {
      if (dto.variantId) {
        const variant = await tx.variant.findUnique({
          where: { id: dto.variantId },
        });
        if (!variant) {
          throw new NotFoundException(
            `Variant with ID ${dto.variantId} not found`,
          );
        }
        if (variant.featureFlagId !== featureFlagId) {
          throw new BadRequestException(
            'Variant does not belong to the same feature flag',
          );
        }
        variantId = dto.variantId;
      } else if (dto.name) {
        const existing = await tx.variant.findFirst({
          where: { featureFlagId, name: dto.name },
        });
        if (existing) {
          throw new BadRequestException(
            `Variant with name "${dto.name}" already exists for this feature flag`,
          );
        }

        const hasPayload = dto.payload != null;
        const hasPayloadType = dto.payloadType != null;
        if (hasPayload !== hasPayloadType) {
          throw new BadRequestException(
            'payload and payloadType must be provided together',
          );
        }

        const created = await tx.variant.create({
          data: {
            name: dto.name,
            description: dto.description,
            payload: dto.payload,
            payloadType: dto.payloadType,
            colorTag: dto.colorTag ?? 'gray',
            featureFlagId,
          },
        });
        variantId = created.id;
      } else {
        throw new BadRequestException(
          'Either variantId or name must be provided',
        );
      }

      const existingSV = await tx.strategyVariant.findUnique({
        where: {
          strategyId_variantId: { strategyId, variantId },
        },
      });
      if (existingSV) {
        throw new BadRequestException('Variant already added to this strategy');
      }

      const isCustomWeight = dto.isCustomWeight ?? false;
      const weight = isCustomWeight ? (dto.weight ?? 0) : 0;

      if (isCustomWeight && weight > 0) {
        const existingCustomSVs = await tx.strategyVariant.findMany({
          where: { strategyId, isCustomWeight: true, isArchived: false },
        });
        const currentCustomSum = existingCustomSVs.reduce(
          (sum, sv) => sum + sv.weight,
          0,
        );
        if (currentCustomSum + weight > 100) {
          throw new BadRequestException(
            `Total weight cannot exceed 100. Current custom weight sum: ${currentCustomSum}, attempted to add: ${weight}`,
          );
        }
      }

      await tx.strategyVariant.create({
        data: {
          strategyId,
          variantId,
          weight,
          isCustomWeight,
        },
      });

      await this.redistributeNonCustomWeights(tx, strategyId);

      const strategyVariant = await tx.strategyVariant.findUnique({
        where: { strategyId_variantId: { strategyId, variantId } },
        include: { variant: true, strategy: true },
      });

      await this.environmentService.incrementEnvironmentVersion(
        strategy.featureFlagEnvironment.environmentId,
      );
      await this.accessService.invalidateCacheByProject(project.id);

      await this.auditLogService.logAction({
        organizationId: project.organizationId,
        projectId: project.id,
        userId: currentUser.id,
        action: AuditAction.UPDATE,
        resourceType: ResourceType.STRATEGY,
        resourceId: strategy.id,
        metadata: AuditMetadata.build()
          .withStrategy({
            id: strategy.id,
            name: strategy.name,
          })
          .withEnvironment({
            id: strategy.featureFlagEnvironment.environment.id,
            name: strategy.featureFlagEnvironment.environment.name,
          })
          .withVariant({
            id: strategyVariant.variant.id,
            name: strategyVariant.variant.name,
          })
          .toJSON(),
      });

      return strategyVariant;
    });
  }

  async batchAddVariantsToStrategy(
    currentUser: User,
    projectId: string,
    strategyId: string,
    dto: BatchCreateStrategyVariantsRequestDto,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        strategyVariants: true,
        featureFlagEnvironment: {
          include: { featureFlag: true, environment: true },
        },
      },
    });
    if (!strategy) {
      throw new NotFoundException(`Strategy with ID ${strategyId} not found`);
    }

    const featureFlagId = strategy.featureFlagEnvironment.featureFlagId;

    const batchStrategyVariants = await this.prisma.$transaction(async (tx) => {
      const results: any[] = [];

      for (const item of dto.variants) {
        let variantId: string;

        if (item.variantId) {
          const variant = await tx.variant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) {
            throw new NotFoundException(
              `Variant with ID ${item.variantId} not found`,
            );
          }
          if (variant.featureFlagId !== featureFlagId) {
            throw new BadRequestException(
              'Variant does not belong to the same feature flag',
            );
          }
          variantId = item.variantId;
        } else if (item.name) {
          const existing = await tx.variant.findFirst({
            where: { featureFlagId, name: item.name },
          });
          if (existing) {
            throw new BadRequestException(
              `Variant with name "${item.name}" already exists for this feature flag`,
            );
          }

          const hasPayload = item.payload != null;
          const hasPayloadType = item.payloadType != null;
          if (hasPayload !== hasPayloadType) {
            throw new BadRequestException(
              'payload and payloadType must be provided together',
            );
          }

          const created = await tx.variant.create({
            data: {
              name: item.name,
              description: item.description,
              payload: item.payload,
              payloadType: item.payloadType,
              colorTag: item.colorTag ?? 'gray',
              featureFlagId,
            },
          });
          variantId = created.id;
        } else {
          throw new BadRequestException(
            'Either variantId or name must be provided',
          );
        }

        const existingSV = await tx.strategyVariant.findUnique({
          where: {
            strategyId_variantId: { strategyId, variantId },
          },
        });
        if (existingSV) {
          throw new BadRequestException(
            'Variant already added to this strategy',
          );
        }

        const isCustomWeight = item.isCustomWeight ?? false;
        const weight = isCustomWeight ? (item.weight ?? 0) : 0;

        if (isCustomWeight && weight > 0) {
          const existingCustomSVs = await tx.strategyVariant.findMany({
            where: { strategyId, isCustomWeight: true, isArchived: false },
          });
          const currentCustomSum = existingCustomSVs.reduce(
            (sum, sv) => sum + sv.weight,
            0,
          );
          if (currentCustomSum + weight > 100) {
            throw new BadRequestException(
              `Total weight cannot exceed 100. Current custom weight sum: ${currentCustomSum}, attempted to add: ${weight}`,
            );
          }
        }

        await tx.strategyVariant.create({
          data: {
            strategyId,
            variantId,
            weight,
            isCustomWeight,
          },
        });

        await this.redistributeNonCustomWeights(tx, strategyId);

        const created = await tx.strategyVariant.findUnique({
          where: { strategyId_variantId: { strategyId, variantId } },
          include: { variant: true, strategy: true },
        });
        results.push(created);
      }

      return results;
    });

    await this.environmentService.incrementEnvironmentVersion(
      strategy.featureFlagEnvironment.environmentId,
    );
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.STRATEGY,
      resourceId: strategy.id,
      metadata: AuditMetadata.build()
        .withStrategy({
          id: strategy.id,
          name: strategy.name,
        })
        .withEnvironment({
          id: strategy.featureFlagEnvironment.environment.id,
          name: strategy.featureFlagEnvironment.environment.name,
        })
        .with({
          batchStrategyVariants: batchStrategyVariants.map((sv) => ({
            variantId: sv.variantId,
            variantName: sv.variant.name,
          })),
        })
        .toJSON(),
    });

    return batchStrategyVariants;
  }

  async updateStrategyVariant(
    currentUser: User,
    projectId: string,
    strategyId: string,
    variantId: string,
    dto: UpdateStrategyVariantRequestDto,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const strategy = await this.prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        strategyVariants: true,
        featureFlagEnvironment: {
          include: { featureFlag: true, environment: true },
        },
      },
    });
    if (!strategy) {
      throw new NotFoundException(`Strategy with id ${strategyId} not found`);
    }
    const sv = await this.prisma.strategyVariant.findUnique({
      where: {
        strategyId_variantId: { strategyId, variantId },
      },
    });
    if (!sv) {
      throw new NotFoundException(
        `StrategyVariant with strategyId ${strategyId} and variantId ${variantId} not found`,
      );
    }

    const wasCustomWeight = sv.isCustomWeight;
    const newIsCustomWeight = dto.isCustomWeight ?? wasCustomWeight;
    const newWeight = dto.weight ?? sv.weight;

    const changes: { field: string; before: unknown; after: unknown }[] = [];

    const updatedStrategyVariant = await this.prisma.$transaction(
      async (tx) => {
        if (newIsCustomWeight && dto.weight !== undefined) {
          changes.push({
            field: 'isCustomWeight',
            before: sv.isCustomWeight,
            after: newIsCustomWeight,
          });
          const otherCustomSVs = await tx.strategyVariant.findMany({
            where: {
              strategyId,
              isCustomWeight: true,
              id: { not: sv.id },
              isArchived: false,
            },
          });
          const otherCustomSum = otherCustomSVs.reduce(
            (sum, s) => sum + s.weight,
            0,
          );
          if (otherCustomSum + newWeight > 100) {
            throw new BadRequestException(
              `Total weight cannot exceed 100. Other custom weight sum: ${otherCustomSum}, attempted: ${newWeight}`,
            );
          }
        }

        await tx.strategyVariant.update({
          where: { id: sv.id },
          data: {
            weight: newIsCustomWeight ? newWeight : 0,
            isCustomWeight: newIsCustomWeight,
          },
        });

        await this.redistributeNonCustomWeights(tx, strategyId);

        changes.push({
          field: 'weight',
          before: sv.weight,
          after: newWeight,
        });

        return tx.strategyVariant.findUnique({
          where: { id: sv.id },
          include: { variant: true, strategy: true },
        });
      },
    );

    await this.environmentService.incrementEnvironmentVersion(
      strategy.featureFlagEnvironment.environmentId,
    );
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.STRATEGY,
      resourceId: strategy.id,
      metadata: AuditMetadata.build()
        .withStrategy({
          id: strategy.id,
          name: strategy.name,
        })
        .withEnvironment({
          id: strategy.featureFlagEnvironment.environment.id,
          name: strategy.featureFlagEnvironment.environment.name,
        })
        .with({
          variantId: updatedStrategyVariant.variantId,
          variantName: updatedStrategyVariant.variant.name,
        })
        .withChanges(changes)
        .toJSON(),
    });

    return updatedStrategyVariant;
  }

  async removeVariantFromStrategy(
    currentUser: User,
    projectId: string,
    strategyId: string,
    variantId: string,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const strategyVariant = await this.prisma.strategyVariant.findUnique({
      where: {
        strategyId_variantId: { strategyId, variantId },
      },
      // include: { strategy: { select: { featureFlagEnvironmentId: true } } },
      include: {
        variant: true,
        strategy: {
          include: {
            featureFlagEnvironment: {
              include: {
                environment: true,
              },
            },
          },
        },
      },
    });
    if (!strategyVariant) {
      throw new NotFoundException(
        `StrategyVariant with strategyId ${strategyId} and variantId ${variantId} not found`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.strategyVariant.delete({ where: { id: strategyVariant.id } });

      await this.redistributeNonCustomWeights(tx, strategyId);

      return { message: 'Variant removed from strategy successfully' };
    });

    await this.environmentService.incrementEnvironmentVersion(
      strategyVariant.strategy.featureFlagEnvironment.environmentId,
    );
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.STRATEGY_VARIANT,
      resourceId: strategyVariant.id,
      metadata: AuditMetadata.build()
        .withStrategy({
          id: strategyVariant.strategy.id,
          name: strategyVariant.strategy.name,
        })
        .withEnvironment({
          id: strategyVariant.strategy.featureFlagEnvironment.environment.id,
          name: strategyVariant.strategy.featureFlagEnvironment.environment
            .name,
        })
        .with({
          variantId: strategyVariant.variantId,
          variantName: strategyVariant.variant.name,
        })
        .toJSON(),
    });

    return result;
  }

  private async redistributeNonCustomWeights(
    tx: Prisma.TransactionClient,
    strategyId: string,
  ): Promise<void> {
    const allSVs = await tx.strategyVariant.findMany({
      where: { strategyId, isArchived: false },
    });

    const customSVs = allSVs.filter((sv) => sv.isCustomWeight);
    const nonCustomSVs = allSVs.filter((sv) => !sv.isCustomWeight);

    if (nonCustomSVs.length === 0) return;

    const customWeightSum = customSVs.reduce((sum, sv) => sum + sv.weight, 0);
    const remaining = Math.max(0, 100 - customWeightSum);
    const base = Math.floor(remaining / nonCustomSVs.length);
    const remainder = remaining - base * nonCustomSVs.length;

    await Promise.all(
      nonCustomSVs.map((sv, i) =>
        tx.strategyVariant.update({
          where: { id: sv.id },
          data: { weight: i === 0 ? base + remainder : base },
        }),
      ),
    );
  }

  private async getProjectByIdOrSlug(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
      include: {
        organization: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private validateRuleFields(dto: CreateStrategyRuleRequestDto): void {
    if (!dto.field || dto.field.trim() === '') {
      throw new BadRequestException('Field is required');
    }

    const config = OPERATOR_CONFIG[dto.operator];

    if (!config) {
      throw new BadRequestException(`Unsupported operator: ${dto.operator}`);
    }

    this.validateRuleNot(dto, config);
    this.validateOperatorValue(dto, config);
  }

  private validateRuleNot(
    dto: CreateStrategyRuleRequestDto,
    config: OperatorConfig,
  ): void {
    if (dto.not !== undefined && typeof dto.not !== 'boolean') {
      throw new BadRequestException('Field "not" must be a boolean');
    }

    if (dto.not && !config.supportsNot) {
      throw new BadRequestException(
        `Operator ${dto.operator} does not support "not"`,
      );
    }
  }

  private validateOperatorValue(
    dto: CreateStrategyRuleRequestDto,
    config: OperatorConfig,
  ): void {
    if (!config.validate) {
      return;
    }

    const isValid = config.validate(dto.value);

    if (!isValid) {
      throw new BadRequestException(
        config.errorMessage ?? `Invalid value for operator ${dto.operator}`,
      );
    }
  }
}
