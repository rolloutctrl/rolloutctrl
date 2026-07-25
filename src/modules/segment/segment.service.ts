import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  ResourceType,
  Segment,
  SegmentRule,
  User,
} from 'src/common/generated/prisma/client';
import {
  CreateSegmentRequestDto,
  UpdateSegmentRequestDto,
  CreateSegmentRuleRequestDto,
  UpdateSegmentRuleRequestDto,
  CopySegmentToProjectDto,
} from './dto';
import { EnvironmentService } from '../environment/environment.service';
import { AccessService } from '../access/access.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditMetadata } from '../audit-log/lib';

@Injectable()
export class SegmentService {
  constructor(
    private prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly environmentService: EnvironmentService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createSegment(
    currentUser: User,
    dto: CreateSegmentRequestDto,
  ): Promise<Segment> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existingSegment = await this.prisma.segment.findUnique({
      where: {
        projectId_key: {
          projectId: project.id,
          key: dto.key,
        },
      },
    });

    if (existingSegment) {
      throw new ConflictException(
        `Segment with key '${dto.key}' already exists in this project`,
      );
    }

    const newSegment = await this.prisma.$transaction(async (prisma) => {
      const segment = await prisma.segment.create({
        data: {
          projectId: project.id,
          key: dto.key,
          name: dto.name,
          description: dto.description,
        },
        include: {
          rules: { orderBy: { priority: 'desc' } },
        },
      });
      for (const rule of dto.rules) {
        await prisma.segmentRule.create({
          data: {
            segmentId: segment.id,
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            not: rule.not ?? false,
          },
        });
      }

      return segment;
    });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }

    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.CREATE,
      resourceType: ResourceType.SEGMENT,
      resourceId: newSegment.id,
      metadata: AuditMetadata.build()
        .withSegment({
          id: newSegment.id,
          name: newSegment.name,
        })
        .toJSON(),
    });

    return this.prisma.segment.findFirst({
      where: { id: newSegment.id, projectId: project.id },
      include: {
        rules: true,
        project: true,
      },
    });
  }

  async findAllSegments(projectId: string): Promise<Segment[]> {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.segment.findMany({
      where: { projectId: project.id },
      include: {
        rules: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSegmentById(
    segmentId: string,
    projectId: string,
  ): Promise<Segment> {
    const project = await this.getProjectByIdOrSlug(projectId);
    const segment = await this.prisma.segment.findFirst({
      where: { id: segmentId, projectId: project.id },
      include: {
        rules: true,
        project: true,
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    return segment;
  }

  async updateSegment(
    currentUser: User,
    projectId: string,
    segmentId: string,
    dto: UpdateSegmentRequestDto,
  ): Promise<Segment> {
    const project = await this.getProjectByIdOrSlug(projectId);

    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
      include: {
        rules: true,
        project: {
          include: {
            environments: true,
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    if (dto.key && dto.key !== segment.key) {
      const existingSegment = await this.prisma.segment.findUnique({
        where: {
          projectId_key: {
            projectId: segment.projectId,
            key: dto.key,
          },
        },
      });

      if (existingSegment) {
        throw new ConflictException(
          `Segment with key '${dto.key}' already exists in this project`,
        );
      }
    }

    const updatedSegment = await this.prisma.$transaction(async (prisma) => {
      // Update segment fields
      await prisma.segment.update({
        where: { id: segmentId },
        data: {
          key: dto.key,
          name: dto.name,
          description: dto.description,
        },
      });

      // Get existing rule IDs from database
      const existingRuleIds = new Set(segment.rules.map((r) => r.id));

      // Process rules from DTO
      for (const rule of dto.rules) {
        // Check if this is a new rule (id starts with "segment-rule")
        if (rule.id.startsWith('segment-rule')) {
          // Create new rule
          await prisma.segmentRule.create({
            data: {
              segmentId,
              field: rule.field,
              operator: rule.operator,
              value: rule.value,
              not: rule.not ?? false,
            },
          });
        } else if (existingRuleIds.has(rule.id)) {
          // Update existing rule
          const existingRule = segment.rules.find((r) => r.id === rule.id);
          if (existingRule) {
            await prisma.segmentRule.update({
              where: { id: rule.id },
              data: {
                field: rule.field,
                operator: rule.operator,
                value: rule.value,
                not: rule.not ?? false,
              },
            });
            // Remove from set to track which rules were updated
            existingRuleIds.delete(rule.id);
          }
        }
      }

      // Delete rules that were not in the DTO (removed by user)
      if (existingRuleIds.size > 0) {
        await prisma.segmentRule.deleteMany({
          where: {
            id: {
              in: Array.from(existingRuleIds),
            },
          },
        });
      }

      return segmentId;
    });

    const savedSegment = await this.prisma.segment.findUnique({
      where: { id: updatedSegment },
      include: {
        rules: true,
        project: true,
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
      resourceType: ResourceType.SEGMENT,
      resourceId: savedSegment.id,
      metadata: AuditMetadata.build()
        .withSegment({
          id: savedSegment.id,
          name: savedSegment.name,
        })
        .toJSON(),
    });

    return savedSegment;
  }

  async deleteSegment(currentUser: User, projectId: string, segmentId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const segment = await this.prisma.segment.findFirst({
      where: { id: segmentId },
      include: {
        project: {
          include: {
            environments: true,
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    const result = await this.prisma.segment.delete({
      where: { id: segmentId },
    });

    for (const environment of segment.project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }

    await this.accessService.invalidateCacheByProject(segment.projectId);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.SEGMENT,
      resourceId: segment.id,
      metadata: AuditMetadata.build()
        .withSegment({
          id: segment.id,
          name: segment.name,
        })
        .toJSON(),
    });

    return result;
  }

  async createSegmentRule(
    dto: CreateSegmentRuleRequestDto,
  ): Promise<SegmentRule> {
    const segment = await this.prisma.segment.findUnique({
      where: { id: dto.segmentId },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return this.prisma.segmentRule.create({
      data: {
        segmentId: dto.segmentId,
        field: dto.field,
        operator: dto.operator,
        value: dto.value,
        not: dto.not ?? false,
      },
    });
  }

  async updateSegmentRule(
    ruleId: string,
    dto: UpdateSegmentRuleRequestDto,
  ): Promise<SegmentRule> {
    const rule = await this.prisma.segmentRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Segment rule with ID ${ruleId} not found`);
    }

    return this.prisma.segmentRule.update({
      where: { id: ruleId },
      data: {
        field: dto.field,
        operator: dto.operator,
        value: dto.value,
        not: dto.not ?? false,
      },
    });
  }

  async deleteSegmentRule(ruleId: string): Promise<void> {
    const rule = await this.prisma.segmentRule.findFirst({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new NotFoundException(`Segment rule with ID ${ruleId} not found`);
    }

    await this.prisma.segmentRule.delete({
      where: { id: ruleId },
    });
  }

  async findAllSegmentRules(segmentId: string): Promise<SegmentRule[]> {
    return this.prisma.segmentRule.findMany({
      where: { segmentId },
    });
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

  async copySegmentToProject(dto: CopySegmentToProjectDto) {
    const project = await this.getProjectByIdOrSlug(dto.projectId);
    const segment = await this.prisma.segment.findUnique({
      where: { id: dto.segmentId },
      include: {
        rules: true,
      },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    const existingSegment = await this.prisma.segment.findUnique({
      where: {
        projectId_key: {
          projectId: project.id,
          key: segment.key,
        },
      },
    });

    if (existingSegment) {
      throw new ConflictException(
        `Segment with key '${segment.key}' already exists in project ${project.name}`,
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      const newSegment = await prisma.segment.create({
        data: {
          projectId: project.id,
          key: segment.key,
          name: segment.name,
          description: segment.description,
        },
        include: {
          rules: { orderBy: { priority: 'desc' } },
        },
      });
      for (const rule of segment.rules) {
        await prisma.segmentRule.create({
          data: {
            segmentId: newSegment.id,
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            not: rule.not ?? false,
          },
        });
      }

      return newSegment;
    });

    return { success: true };
  }
}
