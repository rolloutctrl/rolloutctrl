import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectRequestDto } from '../dto/create-project.dto';
import { slugify } from 'src/common/utils/utils';
import { OrganizationRole, TeamRole } from 'src/common/generated/prisma/client';
import { UpdateProjectRequestDto } from '../dto/update-project.dto';
import { UpdateProjectMemberAccessRequestDto } from '../dto/update-member.dto';
import {
  ENV_DEVELOPMENT_NAME,
  ENV_PRODUCTION_NAME,
} from 'src/common/constants/environment.constants';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    organizationId: string,
    dto: CreateProjectRequestDto,
  ) {
    const { name, slug, description } = dto;

    if (!organizationId) {
      throw new BadRequestException('Missing organization context');
    }

    const existingProject = await this.prisma.project.findFirst({
      where: {
        OR: [{ name: { equals: name } }, { slug: { equals: slug } }],
        organizationId,
      },
    });

    if (existingProject) {
      throw new ConflictException(
        `Project with name '${name}' already exists in this organization`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          slug: slugify(slug),
          description,
          organizationId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: TeamRole.OWNER,
        },
      });

      await Promise.all([
        tx.environment.create({
          data: {
            name: ENV_DEVELOPMENT_NAME,
            projectId: project.id,
            isSystem: true,
          },
        }),
        tx.environment.create({
          data: {
            name: ENV_PRODUCTION_NAME,
            projectId: project.id,
            isSystem: true,
          },
        }),
      ]);

      return project;
    });
  }

  async update({
    projectId,
    name,
    slug,
    description,
  }: UpdateProjectRequestDto) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const existingProject = await this.prisma.project.findFirst({
      where: {
        id: { not: project.id },
        OR: [{ name: { equals: name } }, { slug: { equals: slug } }],
        organizationId: project.organizationId,
      },
      include: {
        organization: true,
      },
    });

    if (existingProject) {
      throw new ConflictException(
        `Project with name '${name}' or '${slug}' already exists in this organization`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      return tx.project.update({
        where: {
          id: project.id,
        },
        data: {
          name,
          slug: slugify(slug),
          description,
        },
      });
    });
  }

  async getProjectMembers(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    return await this.prisma.projectMember.findMany({
      where: {
        projectId: project.id,
        user: {
          isActive: true,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async updateProjectMemberAccess(
    projectId: string,
    dto: UpdateProjectMemberAccessRequestDto,
  ) {
    const project = await this.getProjectByIdOrSlug(projectId);

    return this.prisma.$transaction(async (tx) => {
      return tx.projectMember.update({
        where: {
          id: dto.projectMemberId,
          projectId: project.id,
        },
        data: {
          role: dto.role,
        },
      });
    });
  }

  async findAll(
    userId: string,
    organizationId: string,
    organizationRole: OrganizationRole,
  ) {
    const isPrivileged = organizationRole === OrganizationRole.OWNER;

    const projects = await this.prisma.project.findMany({
      where: {
        organizationId,
        ...(isPrivileged ? {} : { members: { some: { userId } } }),
      },
    });

    return Promise.all(
      projects.map(async (project) => {
        const stats = await this.computeProjectStats(project.id);
        return { ...project, ...stats };
      }),
    );
  }

  private async computeProjectStats(projectId: string) {
    const [activeFlags, activeActions, flagEnvironments] = await Promise.all([
      this.prisma.featureFlag.count({
        where: {
          projectId,
          environments: {
            some: {
              enabled: true,
            },
          },
          archived: false,
        },
      }),
      this.prisma.action.count({
        where: { projectId, enabled: true },
      }),
      this.prisma.featureFlagEnvironment.findMany({
        where: { featureFlag: { projectId } },
        include: {
          strategies: {
            include: { rules: true, segments: true },
          },
        },
      }),
    ]);

    let warningCount = 0;
    let errorCount = 0;

    for (const ffe of flagEnvironments) {
      const strategies = ffe.strategies;

      // if (strategies.length === 0) {
      //   warningCount++;
      //   continue;
      // }

      const sorted = [...strategies].sort((a, b) => b.priority - a.priority);

      for (let i = 0; i < sorted.length; i++) {
        const s = sorted[i];

        // ERROR / WARNING: invalid rollout range
        if (s.rolloutPercentage !== null && s.rolloutPercentage !== undefined) {
          if (s.rolloutPercentage < 0 || s.rolloutPercentage > 100) {
            errorCount++;
          } else if (s.rolloutPercentage === 0) {
            warningCount++;
            continue;
          } else if (s.rolloutPercentage === 100) {
            warningCount++;
          }
        }

        // ERROR: unreachable strategy
        if (i > 0) {
          const currentNorm = s.rules.map((r) => ({
            field: r.field.toLowerCase().trim(),
            operator: r.operator,
            value: Array.isArray(r.value)
              ? (r.value as unknown[]).map(String).sort().join(',')
              : String(r.value ?? '')
                  .toLowerCase()
                  .trim(),
          }));

          for (let j = 0; j < i; j++) {
            const higher = sorted[j];
            if (higher.rolloutPercentage === 0) continue;
            const segmentCompatible =
              !higher.segments ||
              higher.segments.length === 0 ||
              (s.segments &&
                higher.segments.some((hs) =>
                  s.segments.some((ss) => ss.id === hs.id),
                ));
            if (!segmentCompatible) continue;

            const higherNorm = higher.rules.map((r) => ({
              field: r.field.toLowerCase().trim(),
              operator: r.operator,
              value: Array.isArray(r.value)
                ? (r.value as unknown[]).map(String).sort().join(',')
                : String(r.value ?? '')
                    .toLowerCase()
                    .trim(),
            }));

            const isSubset = higherNorm.every((h) =>
              currentNorm.some(
                (c) =>
                  c.field === h.field &&
                  c.operator === h.operator &&
                  c.value === h.value,
              ),
            );

            if (isSubset) {
              errorCount++;
              break;
            }
          }
        }
      }
    }

    return {
      totalActiveFlags: activeFlags,
      totalActiveActions: activeActions,
      warningCount,
      errorCount,
    };
  }

  async getProjectCounts(projectId: string): Promise<{
    activeFlagsCount: number;
    activeActionsCount: number;
    environmentsCount: number;
  }> {
    const [activeFlags, activeActions, environments] = await Promise.all([
      this.prisma.featureFlag.count({
        where: {
          projectId,
          environments: {
            some: {
              enabled: true,
            },
          },
          archived: false,
        },
      }),
      this.prisma.action.count({
        where: { projectId, enabled: true },
      }),
      this.prisma.environment.count({
        where: { projectId },
      }),
    ]);

    return {
      activeFlagsCount: activeFlags,
      activeActionsCount: activeActions,
      environmentsCount: environments,
    };
  }

  async findById(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const counts = await this.getProjectCounts(project.id);

    return {
      ...project,
      ...counts,
    };
  }

  async getProjectByIdOrSlug(projectId: string) {
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

  async search(projectId: string, query: string) {
    const project = await this.getProjectByIdOrSlug(projectId);
    const q = query?.trim() ?? '';

    if (!q) {
      return [];
    }

    const searchFilter = { contains: q, mode: 'insensitive' as const };

    const [featureFlags, actions, segments, strategies, variants] =
      await Promise.all([
        this.prisma.featureFlag.findMany({
          where: {
            projectId: project.id,
            OR: [
              { id: searchFilter },
              { key: searchFilter },
              { description: searchFilter },
            ],
          },
          select: {
            id: true,
            key: true,
            description: true,
            archived: true,
            createdAt: true,
          },
          take: 10,
        }),

        this.prisma.action.findMany({
          where: {
            projectId: project.id,
            OR: [
              { id: searchFilter },
              { key: searchFilter },
              { description: searchFilter },
            ],
          },
          select: {
            id: true,
            key: true,
            description: true,
            enabled: true,
            createdAt: true,
          },
          take: 10,
        }),

        this.prisma.segment.findMany({
          where: {
            projectId: project.id,
            OR: [
              { id: searchFilter },
              { key: searchFilter },
              { name: searchFilter },
              { description: searchFilter },
            ],
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            createdAt: true,
          },
          take: 10,
        }),

        this.prisma.strategy.findMany({
          where: {
            OR: [{ id: searchFilter }, { name: searchFilter }],
            featureFlagEnvironment: {
              featureFlag: { projectId: project.id },
            },
          },
          select: {
            id: true,
            name: true,
            enabled: true,
            createdAt: true,
            featureFlagEnvironment: {
              select: {
                featureFlag: { select: { key: true } },
                environment: { select: { name: true } },
              },
            },
          },
          take: 10,
        }),

        this.prisma.variant.findMany({
          where: {
            featureFlag: { projectId: project.id },
            OR: [
              { id: searchFilter },
              { name: searchFilter },
              { description: searchFilter },
            ],
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            featureFlag: {
              select: { key: true },
            },
          },
          take: 10,
        }),
      ]);

    return [
      ...featureFlags.map((item) => ({
        type: 'feature_flag' as const,
        ...item,
      })),
      ...actions.map((item) => ({
        type: 'action' as const,
        ...item,
      })),
      ...segments.map((item) => ({
        type: 'segment' as const,
        ...item,
      })),
      ...strategies.map((item) => ({
        type: 'strategy' as const,
        id: item.id,
        name: item.name,
        enabled: item.enabled,
        createdAt: item.createdAt,
        featureFlagKey: item.featureFlagEnvironment.featureFlag.key,
        environmentName: item.featureFlagEnvironment.environment.name,
      })),
      ...variants.map((item) => ({
        type: 'variant' as const,
        id: item.id,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        featureFlagKey: item.featureFlag.key,
      })),
    ];
  }

  async delete(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    return this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.apiKey.deleteMany({ where: { projectId: project.id } }),
        tx.projectMember.deleteMany({ where: { projectId: project.id } }),
      ]);

      return tx.project.delete({ where: { id: project.id } });
    });
  }

  async getProjectOverview(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const [
      totalFeatureFlags,
      activeFeatureFlags,
      totalSegments,
      activeSegments,
      totalActions,
      activeActions,
      members,
      environments,
      rolloutFlagEnvironments,
      fullyEnabledWithoutStrategies,
      enabledWithNoRolloutStrategies,
    ] = await Promise.all([
      this.prisma.featureFlag.count({
        where: { projectId: project.id },
      }),

      this.prisma.featureFlag.count({
        where: {
          projectId: project.id,
          environments: { some: { enabled: true } },
        },
      }),

      this.prisma.segment.count({
        where: { projectId: project.id },
      }),

      this.prisma.segment.count({
        where: {
          projectId: project.id,
          OR: [
            { strategies: { some: {} } },
            { actionStrategies: { some: {} } },
          ],
        },
      }),

      this.prisma.action.count({
        where: { projectId: project.id },
      }),

      this.prisma.action.count({
        where: { projectId: project.id, enabled: true },
      }),

      this.prisma.projectMember.findMany({
        where: { projectId: project.id, user: { isActive: true } },
        include: { user: true },
      }),

      this.prisma.environment.findMany({
        where: { projectId: project.id },
        include: {
          _count: {
            select: {
              featureFlags: { where: { enabled: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),

      this.prisma.strategy.findMany({
        where: {
          featureFlagEnvironment: {
            enabled: true,
            featureFlag: { projectId: project.id },
          },
          rolloutPercentage: { not: null },
        },
        select: {
          rolloutPercentage: true,
          featureFlagEnvironment: {
            select: {
              enabled: true,
              featureFlag: { select: { key: true } },
              environment: { select: { name: true } },
            },
          },
        },
      }),

      this.prisma.featureFlagEnvironment.findMany({
        where: {
          featureFlag: { projectId: project.id },
          enabled: true,
          strategies: { none: {} },
        },
        select: {
          featureFlag: { select: { key: true } },
          environment: { select: { name: true } },
        },
      }),

      this.prisma.featureFlagEnvironment.findMany({
        where: {
          featureFlag: { projectId: project.id },
          enabled: true,
          strategies: {
            some: {},
            none: {
              OR: [
                { rolloutPercentage: { not: null } },
                { rolloutStickinessField: { not: null } },
              ],
            },
          },
        },
        select: {
          featureFlag: { select: { key: true } },
          environment: { select: { name: true } },
        },
      }),
    ]);

    const environmentSummary = environments.map((env) => ({
      id: env.id,
      name: env.name,
      activeFeatureFlags: env._count.featureFlags,
    }));

    const rolloutFromStrategies = rolloutFlagEnvironments.map((s) => ({
      flagKey: s.featureFlagEnvironment.featureFlag.key,
      env: s.featureFlagEnvironment.environment.name,
      rolloutPercentage: s.rolloutPercentage as number,
    }));

    const rolloutFromFullyEnabled = fullyEnabledWithoutStrategies.map(
      (ffe) => ({
        flagKey: ffe.featureFlag.key,
        env: ffe.environment.name,
        rolloutPercentage: 100,
      }),
    );

    const rolloutFromNoRolloutStrategies = enabledWithNoRolloutStrategies.map(
      (ffe) => ({
        flagKey: ffe.featureFlag.key,
        env: ffe.environment.name,
        rolloutPercentage: 100,
      }),
    );

    const activeRollouts = [
      ...rolloutFromStrategies,
      ...rolloutFromFullyEnabled,
      ...rolloutFromNoRolloutStrategies,
    ];

    return {
      featureFlags: {
        total: totalFeatureFlags,
        active: activeFeatureFlags,
      },
      segments: {
        total: totalSegments,
        active: activeSegments,
      },
      actions: {
        total: totalActions,
        active: activeActions,
      },
      members,
      environments: environmentSummary,
      activeRollouts,
    };
  }
}
