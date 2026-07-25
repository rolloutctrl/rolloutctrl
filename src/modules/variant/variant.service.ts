import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  ResourceType,
  User,
  Variant,
} from 'src/common/generated/prisma/client';
import { CreateVariantRequestDto, UpdateVariantRequestDto } from './dto';
import { AccessService } from '../access/access.service';
import { EnvironmentService } from '../environment/environment.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditMetadata } from '../audit-log/lib';

@Injectable()
export class VariantService {
  constructor(
    private prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly auditLogService: AuditLogService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async createVariant(
    currentUser: User,
    dto: CreateVariantRequestDto,
  ): Promise<Variant> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        OR: [{ id: dto.featureFlagId }, { key: dto.featureFlagId }],
        projectId: project.id,
      },
    });
    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    const hasPayload = dto.payload != null;
    const hasPayloadType = dto.payloadType != null;
    if (hasPayload !== hasPayloadType) {
      throw new ConflictException(
        'payload and payloadType must be provided together',
      );
    }

    const existingVariant = await this.prisma.variant.findFirst({
      where: {
        featureFlagId: flag.id,
        name: dto.name,
      },
    });

    if (existingVariant) {
      throw new ConflictException(
        `Variant with name "${dto.name}" already exists for this feature flag`,
      );
    }

    const createdVariant = await this.prisma.variant.create({
      data: {
        name: dto.name,
        description: dto.description,
        payload: dto.payload,
        payloadType: dto.payloadType,
        colorTag: dto.colorTag,
        featureFlagId: flag.id,
      },
      include: {
        featureFlag: true,
        strategyVariants: { include: { strategy: true } },
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
      action: AuditAction.CREATE,
      resourceType: ResourceType.VARIANT,
      resourceId: createdVariant.id,
      metadata: AuditMetadata.build()
        .withFlag({
          id: flag.id,
          name: flag.key,
        })
        .withVariant({
          id: createdVariant.id,
          name: createdVariant.name,
        })
        .toJSON(),
    });

    return createdVariant;
  }

  async findAllVariantsByFlagId(flagId: string, projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);

    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        OR: [{ id: flagId }, { key: flagId }],
        projectId: project.id,
      },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${flagId} not found`);
    }

    const variants = await this.prisma.variant.findMany({
      where: { featureFlagId: flag.id },
      orderBy: { createdAt: 'asc' },
      include: {
        strategyVariants: {
          include: {
            strategy: {
              include: {
                featureFlagEnvironment: {
                  include: {
                    environment: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return variants;
  }

  async findVariantById(
    variantId: string,
    projectId: string,
  ): Promise<Variant> {
    const project = await this.getProjectByIdOrSlug(projectId);

    const variant = await this.prisma.variant.findFirst({
      where: {
        id: variantId,
        featureFlag: { projectId: project.id },
      },
      include: {
        featureFlag: true,
        strategyVariants: { include: { strategy: true } },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    return variant;
  }

  async updateVariant(
    currentUser: User,
    variantId: string,
    dto: UpdateVariantRequestDto,
  ): Promise<Variant> {
    const project = await this.getProjectByIdOrSlug(dto.projectId);

    const existingVariant = await this.prisma.variant.findFirst({
      where: {
        id: variantId,
        featureFlag: { projectId: project.id },
      },
      include: {
        featureFlag: true,
      },
    });

    if (!existingVariant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    const hasPayload = dto.payload != null;
    const hasPayloadType = dto.payloadType != null;
    if (hasPayload !== hasPayloadType) {
      throw new ConflictException(
        'payload and payloadType must be provided together',
      );
    }

    if (dto.name) {
      const duplicate = await this.prisma.variant.findFirst({
        where: {
          featureFlagId: existingVariant.featureFlagId,
          name: dto.name,
          id: { not: variantId },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Variant with name "${dto.name}" already exists for this feature flag`,
        );
      }
    }

    const updatedVariant = await this.prisma.variant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        description: dto.description,
        payload: dto.payload,
        payloadType: dto.payloadType,
        colorTag: dto.colorTag,
      },
      include: {
        featureFlag: true,
        strategyVariants: { include: { strategy: true } },
      },
    });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }
    await this.accessService.invalidateCacheByProject(project.id);

    const changes: { field: string; before: unknown; after: unknown }[] = [];

    if (dto.name !== undefined && dto.name !== existingVariant.name) {
      changes.push({
        field: 'name',
        before: existingVariant.name,
        after: dto.name,
      });
    }
    if (dto.payload !== undefined && dto.payload !== existingVariant.payload) {
      changes.push({
        field: 'payload',
        before: existingVariant.payload,
        after: dto.payload,
      });
    }
    if (
      dto.payloadType !== undefined &&
      dto.payloadType !== existingVariant.payloadType
    ) {
      changes.push({
        field: 'payloadType',
        before: existingVariant.payloadType,
        after: dto.payloadType,
      });
    }
    if (
      dto.colorTag !== undefined &&
      dto.colorTag !== existingVariant.colorTag
    ) {
      changes.push({
        field: 'colorTag',
        before: existingVariant.colorTag,
        after: dto.colorTag,
      });
    }

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.VARIANT,
      resourceId: variantId,
      metadata: AuditMetadata.build()
        .withFlag({
          id: existingVariant.featureFlagId,
          name: existingVariant.featureFlag.key,
        })
        .withVariant({
          id: existingVariant.id,
          name: existingVariant.name,
        })
        .withChanges(changes)
        .toJSON(),
    });

    return updatedVariant;
  }

  async deleteVariant(
    currentUser: User,
    variantId: string,
    projectId: string,
  ): Promise<void> {
    const project = await this.getProjectByIdOrSlug(projectId);

    const variant = await this.prisma.variant.findFirst({
      where: {
        id: variantId,
        featureFlag: { projectId: project.id },
      },
      include: {
        featureFlag: true,
        strategyVariants: true,
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.strategyVariant.deleteMany({
        where: { variantId },
      });

      for (const sv of variant.strategyVariants) {
        await this.redistributeNonCustomWeights(tx, sv.strategyId);
      }

      await tx.variant.delete({ where: { id: variantId } });
    });

    for (const environment of project.environments) {
      await this.environmentService.incrementEnvironmentVersion(environment.id);
    }
    await this.accessService.invalidateCacheByProject(project.id);

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.DELETE,
      resourceType: ResourceType.VARIANT,
      resourceId: variantId,
      metadata: AuditMetadata.build()
        .withFlag({
          id: variant.featureFlagId,
          name: variant.featureFlag.key,
        })
        .withVariant({
          id: variant.id,
          name: variant.name,
        })
        .toJSON(),
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

  private async redistributeNonCustomWeights(
    tx: any,
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
}
