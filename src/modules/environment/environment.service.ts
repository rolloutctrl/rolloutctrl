import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Injectable()
export class EnvironmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const environments = await this.prisma.environment.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            featureFlags: {
              where: { enabled: true },
            },
          },
        },
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    return environments.map(({ _count, ...env }) => ({
      ...env,
      enabledFlagsCount: _count.featureFlags,
    }));
  }

  async findOne(projectId: string, environmentId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const environment = await this.prisma.environment.findFirst({
      where: { id: environmentId, projectId: project.id },
      include: {
        _count: {
          select: {
            featureFlags: {
              where: { enabled: true },
            },
          },
        },
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    return environment;
  }

  async create(dto: CreateEnvironmentDto) {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    const existing = await this.prisma.environment.findUnique({
      where: { projectId_name: { projectId: project.id, name: dto.name } },
    });

    if (existing) {
      throw new ConflictException(
        `Environment with name '${dto.name}' already exists in this project`,
      );
    }

    const environment = await this.prisma.environment.create({
      data: {
        projectId: project.id,
        name: dto.name,
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

    await this.syncFeatureFlagsWithNewEnvironment(environment.id, project.id);

    return environment;
  }

  async update(environmentId: string, dto: UpdateEnvironmentDto) {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    const environment = await this.prisma.environment.findFirst({
      where: { id: environmentId, projectId: project.id },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    if (environment.isSystem) {
      throw new ForbiddenException('System environments cannot be modified');
    }

    if (dto.name && dto.name !== environment.name) {
      const existing = await this.prisma.environment.findUnique({
        where: { projectId_name: { projectId: project.id, name: dto.name } },
      });

      if (existing) {
        throw new ConflictException(
          `Environment with name '${dto.name}' already exists in this project`,
        );
      }
    }

    return this.prisma.environment.update({
      where: { id: environmentId },
      data: { name: dto.name },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(projectId: string, environmentId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const environment = await this.prisma.environment.findFirst({
      where: { id: environmentId, projectId: project.id },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    if (environment.isSystem) {
      throw new ForbiddenException('System environments cannot be deleted');
    }

    return this.prisma.$transaction(async (tx) => {
      const featureFlagEnvironments = await tx.featureFlagEnvironment.findMany({
        where: { environmentId },
        select: { id: true },
      });

      const ffeIds = featureFlagEnvironments.map((ffe) => ffe.id);

      if (ffeIds.length > 0) {
        const strategies = await tx.strategy.findMany({
          where: { featureFlagEnvironmentId: { in: ffeIds } },
          select: { id: true },
        });

        const strategyIds = strategies.map((s) => s.id);

        if (strategyIds.length > 0) {
          await tx.strategyRule.deleteMany({
            where: { strategyId: { in: strategyIds } },
          });

          await tx.strategyVariant.deleteMany({
            where: { strategyId: { in: strategyIds } },
          });

          await tx.exposureEvent.deleteMany({
            where: { strategyId: { in: strategyIds } },
          });

          await tx.metricsBucket.deleteMany({
            where: { strategyId: { in: strategyIds } },
          });

          await tx.strategy.deleteMany({
            where: { id: { in: strategyIds } },
          });
        }

        await tx.exposureEvent.deleteMany({
          where: { featureFlagEnvironmentId: { in: ffeIds } },
        });

        await tx.metricsBucket.deleteMany({
          where: { featureFlagEnvironmentId: { in: ffeIds } },
        });

        await tx.featureFlagEnvironment.deleteMany({
          where: { id: { in: ffeIds } },
        });
      }

      await tx.apiKey.updateMany({
        where: { environmentId },
        data: { environmentId: null },
      });

      return tx.environment.delete({ where: { id: environmentId } });
    });
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

  async getEnvironmentVersion(environmentId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    return environment.version;
  }

  async incrementEnvironmentVersion(environmentId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    await this.prisma.environment.update({
      where: { id: environmentId },
      data: {
        version: {
          increment: 1,
        },
      },
    });
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
}
