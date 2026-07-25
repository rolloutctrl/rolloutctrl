import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditLog,
  AuditAction,
  ResourceType,
} from 'src/common/generated/prisma/client';
import { CreateAuditLogDto, UpdateAuditLogDto, QueryAuditLogDto } from './dto';
import { type AuditMetadataPayload } from './lib';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        organizationId: dto.organizationId,
        projectId: dto.projectId,
        userId: dto.userId,
        action: dto.action,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        resourceName: dto.resourceName ?? null,
        metadata: dto.metadata,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryAuditLogDto) {
    const where: any = {};

    if (query.search) {
      const searchTerm = query.search.trim();
      if (searchTerm) {
        // Find FeatureFlag IDs with matching key
        const featureFlags = await this.prisma.featureFlag.findMany({
          where: {
            key: { contains: searchTerm, mode: 'insensitive' },
          },
          select: { id: true },
        });

        // Find Action IDs with matching key
        const actions = await this.prisma.action.findMany({
          where: {
            key: { contains: searchTerm, mode: 'insensitive' },
          },
          select: { id: true },
        });

        const featureFlagIds = featureFlags.map((f) => f.id);
        const actionIds = actions.map((a) => a.id);

        where.OR = [
          { projectId: { contains: searchTerm, mode: 'insensitive' } },
          { userId: { contains: searchTerm, mode: 'insensitive' } },
          { resourceId: { contains: searchTerm, mode: 'insensitive' } },
          ...(featureFlagIds.length > 0
            ? [{ resourceType: 'FLAG', resourceId: { in: featureFlagIds } }]
            : []),
          ...(actionIds.length > 0
            ? [{ resourceType: 'ACTION', resourceId: { in: actionIds } }]
            : []),
        ];
      }
    }

    if (query.projectId) {
      const project = await this.getProjectByIdOrSlug(query.projectId);
      where.projectId = project.id;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.resourceType) {
      where.resourceType = query.resourceType as ResourceType;
    }

    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 20;

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
    });

    const lastLog = logs[logs.length - 1];
    const nextCursor = lastLog?.id ?? null;

    return {
      data: logs,
      nextCursor,
      hasMore: logs.length === limit,
    };
  }

  async findById(id: string): Promise<AuditLog> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  async update(id: string, dto: UpdateAuditLogDto): Promise<AuditLog> {
    const existingLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      throw new NotFoundException('Audit log not found');
    }

    return this.prisma.auditLog.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        userId: dto.userId,
        action: dto.action,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        resourceName: dto.resourceName ?? null,
        metadata: dto.metadata,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<AuditLog> {
    const existingLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      throw new NotFoundException('Audit log not found');
    }

    return this.prisma.auditLog.delete({
      where: { id },
    });
  }

  async findByResource(
    resourceType: ResourceType,
    resourceId: string,
    projectId?: string,
  ) {
    const where: any = {
      resourceType,
      resourceId,
    };

    if (projectId) {
      const project = await this.getProjectByIdOrSlug(projectId);
      where.projectId = project.id;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByProject(projectId: string, limit: number = 50) {
    const project = await this.getProjectByIdOrSlug(projectId);
    return this.prisma.auditLog.findMany({
      where: {
        projectId: project.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async findByUser(userId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async logAction(params: {
    organizationId: string;
    projectId?: string;
    userId?: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId: string;
    resourceName?: string;
    metadata?: AuditMetadataPayload | Record<string, any>;
  }): Promise<AuditLog> {
    const auditLog = await this.create(params);
    return auditLog;
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
