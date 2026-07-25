import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Action,
  AuditAction,
  ResourceType,
  User,
} from 'src/common/generated/prisma/client';
import {
  CreateActionRequestDto,
  CreateActionStrategyRuleDto,
  UpdateActionRequestDto,
  UpdateActionStrategyRuleDto,
} from './dto';
import { ReorderRulesRequestDto } from '../strategy/dto/reorder-rules.dto';
import { OPERATOR_CONFIG } from 'src/common/constants/operator.constants';
import { AccessService } from '../access/access.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EnvironmentService } from '../environment/environment.service';
import { AuditMetadata } from '../audit-log/lib';

@Injectable()
export class ActionService {
  constructor(
    private prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly auditLogService: AuditLogService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async createAction(
    currentUser: User,
    dto: CreateActionRequestDto,
  ): Promise<Action> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    const existing = await this.prisma.action.findUnique({
      where: { projectId_key: { projectId: project.id, key: dto.key } },
    });

    if (existing) {
      throw new ConflictException(
        `Action with key "${dto.key}" already exists in this project`,
      );
    }

    // Validate segments for all strategies upfront
    if (dto.strategies && dto.strategies.length > 0) {
      const allSegmentIds = dto.strategies
        .flatMap((s) => s.segmentIds ?? [])
        .filter(Boolean);

      if (allSegmentIds.length > 0) {
        const uniqueSegmentIds = [...new Set(allSegmentIds)];
        const segments = await this.prisma.segment.findMany({
          where: { id: { in: uniqueSegmentIds } },
        });
        if (segments.length !== uniqueSegmentIds.length) {
          throw new NotFoundException('One or more segments not found');
        }
      }

      // Validate rule fields for all strategies
      for (const strategy of dto.strategies) {
        if (!strategy.rules || strategy.rules.length === 0) {
          throw new BadRequestException(
            'Each strategy must have at least one rule',
          );
        }
        for (const rule of strategy.rules) {
          this.validateRuleFields(rule);
        }
      }
    }

    const createAction = await this.prisma.$transaction(
      async (tx) => {
        return tx.action.create({
          data: {
            projectId: project.id,
            key: dto.key,
            description: dto.description,
            enabled: dto.enabled ?? true,
            defaultEffect: dto.defaultEffect,
            strategies:
              dto.strategies && dto.strategies.length > 0
                ? {
                    create: dto.strategies.map((strategy, index) => ({
                      effect: strategy.effect,
                      priority: dto.strategies.length - 1 - index,
                      enabled: strategy.enabled ?? true,
                      matchType: strategy.matchType,
                      segments: strategy.segmentIds
                        ? {
                            connect: strategy.segmentIds.map((id) => ({ id })),
                          }
                        : undefined,
                      rules: strategy.rules
                        ? {
                            create: strategy.rules.map((rule) => ({
                              field: rule.field,
                              operator: rule.operator,
                              value: rule.value,
                              not: rule.not ?? false,
                            })),
                          }
                        : undefined,
                    })),
                  }
                : undefined,
          },
          include: {
            strategies: {
              include: { segments: true, rules: true },
              orderBy: { priority: 'desc' },
            },
          },
        });
      },
      { timeout: 15000, maxWait: 10000 },
    );

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.CREATE,
      resourceType: ResourceType.ACTION,
      resourceId: createAction.id,
      metadata: AuditMetadata.build()
        .withAction({
          id: createAction.id,
          name: createAction.key,
        })
        .toJSON(),
    });

    return createAction;
  }

  async findAllActions(projectId: string, cursor?: string, limit: number = 20) {
    const project = await this.getProjectByIdOrSlug(projectId);
    const actions = await this.prisma.action.findMany({
      where: { projectId: project.id },
      include: {
        strategies: {
          include: { segments: true, rules: true },
          orderBy: { priority: 'desc' },
        },
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const lastAction = actions[actions.length - 1];
    const nextCursor = lastAction?.id ?? null;

    return {
      data: actions,
      nextCursor,
      hasMore: actions.length === limit,
    };
  }

  async findActionById(actionId: string, projectId: string): Promise<Action> {
    const project = await this.getProjectByIdOrSlug(projectId);
    const action = await this.prisma.action.findFirst({
      where: {
        OR: [{ id: actionId }, { key: actionId }],
        projectId: project.id,
      },
      include: {
        strategies: {
          include: { segments: true, rules: true },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${actionId} not found`);
    }

    return action;
  }

  async updateAction(
    currentUser: User,
    projectId: string,
    actionId: string,
    dto: UpdateActionRequestDto,
  ): Promise<Action> {
    const project = await this.getProjectByIdOrSlug(projectId);

    const action = await this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        strategies: { include: { rules: true } },
      },
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${actionId} not found`);
    }

    // Validate segments and rules upfront
    if (dto.strategies) {
      const allSegmentIds = dto.strategies
        .flatMap((s) => s.segmentIds ?? [])
        .filter(Boolean);

      if (allSegmentIds.length > 0) {
        const uniqueSegmentIds = [...new Set(allSegmentIds)];
        const segments = await this.prisma.segment.findMany({
          where: { id: { in: uniqueSegmentIds } },
        });
        if (segments.length !== uniqueSegmentIds.length) {
          throw new NotFoundException('One or more segments not found');
        }
      }

      for (const strategy of dto.strategies) {
        if (!strategy.rules || strategy.rules.length === 0) {
          throw new BadRequestException(
            'Each strategy must have at least one rule',
          );
        }
        for (const rule of strategy.rules) {
          this.validateRuleFields(rule);
        }
      }
    }

    const submittedStrategyIds = new Set(
      (dto.strategies ?? []).filter((s) => s.id).map((s) => s.id as string),
    );

    const strategiesToDelete = action.strategies.filter(
      (s) => !submittedStrategyIds.has(s.id),
    );

    await this.prisma.$transaction(
      async (tx) => {
        // Update action fields
        await tx.action.update({
          where: { id: actionId },
          data: {
            key: dto.key,
            description: dto.description,
            enabled: dto.enabled,
            defaultEffect: dto.defaultEffect,
          },
        });

        // Delete removed strategies (rules cascade delete via Prisma)
        if (strategiesToDelete.length > 0) {
          await tx.actionStrategy.deleteMany({
            where: { id: { in: strategiesToDelete.map((s) => s.id) } },
          });
        }

        // Update existing strategies and create new ones
        const strategyOps: Promise<unknown>[] = [];

        for (const strategy of dto.strategies ?? []) {
          if (
            strategy.id &&
            action.strategies.some((s) => s.id === strategy.id)
          ) {
            // Update existing strategy with nested rules rewrite
            strategyOps.push(
              tx.actionStrategy.update({
                where: { id: strategy.id },
                data: {
                  effect: strategy.effect,
                  priority: strategy.priority,
                  enabled: strategy.enabled,
                  matchType: strategy.matchType,
                  segments: strategy.segmentIds
                    ? { set: strategy.segmentIds.map((id) => ({ id })) }
                    : { set: [] },
                  rules: {
                    deleteMany: {},
                    create: (strategy.rules ?? []).map((rule) => ({
                      field: rule.field,
                      operator: rule.operator,
                      value: rule.value,
                      not: rule.not ?? false,
                    })),
                  },
                },
              }),
            );
          } else {
            // Create new strategy with nested rules
            strategyOps.push(
              tx.actionStrategy.create({
                data: {
                  actionId,
                  effect: strategy.effect,
                  priority: 0,
                  enabled: strategy.enabled ?? true,
                  matchType: strategy.matchType,
                  segments: strategy.segmentIds
                    ? { connect: strategy.segmentIds.map((id) => ({ id })) }
                    : undefined,
                  rules: strategy.rules
                    ? {
                        create: strategy.rules.map((rule) => ({
                          field: rule.field,
                          operator: rule.operator,
                          value: rule.value,
                          not: rule.not ?? false,
                        })),
                      }
                    : undefined,
                },
              }),
            );
          }
        }

        await Promise.all(strategyOps);

        // Recalculate priorities for all strategies
        const allStrategies = await tx.actionStrategy.findMany({
          where: { actionId },
          orderBy: { priority: 'desc' },
        });

        await Promise.all(
          allStrategies.map((s, index) =>
            tx.actionStrategy.update({
              where: { id: s.id },
              data: { priority: allStrategies.length - 1 - index },
            }),
          ),
        );
      },
      { timeout: 15000, maxWait: 10000 },
    );

    const updatedAction = await this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        strategies: {
          include: { segments: true, rules: true },
          orderBy: { priority: 'desc' },
        },
      },
    });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.ACTION,
      resourceId: updatedAction.id,
      metadata: AuditMetadata.build()
        .withAction({
          id: updatedAction.id,
          name: updatedAction.key,
        })
        .toJSON(),
    });

    return updatedAction;
  }

  async reorderActionStrategies(
    actionId: string,
    dto: ReorderRulesRequestDto,
  ): Promise<Action> {
    const action = await this.prisma.action.findUnique({
      where: { id: actionId },
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${actionId} not found`);
    }

    await this.prisma.$transaction(
      dto.rules.map((rule, index) =>
        this.prisma.actionStrategy.update({
          where: { id: rule.id },
          data: { priority: dto.rules.length - 1 - index },
        }),
      ),
    );

    return this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        strategies: {
          include: { segments: true, rules: true },
          orderBy: { priority: 'desc' },
        },
      },
    }) as Promise<Action>;
  }

  async deleteAction(currentUser: User, projectId: string, actionId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);
    const action = await this.prisma.action.findUnique({
      where: { id: actionId, projectId: project.id },
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${actionId} not found`);
    }

    await this.prisma.action.delete({ where: { id: action.id } });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.ACTION,
      resourceId: action.id,
      metadata: AuditMetadata.build()
        .withAction({
          id: action.id,
          name: action.key,
        })
        .toJSON(),
    });

    return { message: 'Action removed successfully' };
  }

  async getProjectByIdOrSlug(projectId: string) {
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

    return project;
  }

  private validateRuleFields(
    rule: CreateActionStrategyRuleDto | UpdateActionStrategyRuleDto,
  ): void {
    if (!rule.field || rule.field.trim() === '') {
      throw new BadRequestException('Field is required');
    }

    const config = OPERATOR_CONFIG[rule.operator];

    if (!config) {
      throw new BadRequestException(`Unsupported operator: ${rule.operator}`);
    }

    if (rule.not !== undefined && typeof rule.not !== 'boolean') {
      throw new BadRequestException('Field "not" must be a boolean');
    }

    if (rule.not && !config.supportsNot) {
      throw new BadRequestException(
        `Operator ${rule.operator} does not support "not"`,
      );
    }

    if (config.validate) {
      const isValid = config.validate(rule.value);
      if (!isValid) {
        throw new BadRequestException(
          config.errorMessage ?? `Invalid value for operator ${rule.operator}`,
        );
      }
    }
  }
}
