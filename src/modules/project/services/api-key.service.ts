import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as crypto from 'crypto';
import {
  ApiKey,
  ApiKeyType,
  AuditAction,
  ResourceType,
  User,
} from 'src/common/generated/prisma/client';
import { CreateProjectApiKeyRequestDto } from '../dto/create-api-key.dto';
import { truncateString } from 'src/common/utils/utils';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { AuditMetadata } from 'src/modules/audit-log/lib';
import { ApiKeyBasic } from '../types/api-key.types';

@Injectable()
export class ApiKeyService {
  private readonly apiKeyPrefix = 'rctrl';
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    currentUser: User,
    projectId: string,
    dto: CreateProjectApiKeyRequestDto,
  ) {
    const { name, environmentId, type, allowedOrigins } = dto;
    if (
      !name ||
      !name.length ||
      !projectId ||
      !environmentId ||
      !type ||
      (type === ApiKeyType.CLIENT && !allowedOrigins.length)
    ) {
      throw new BadRequestException('Missing required parameters');
    }
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: projectId }, { slug: projectId }],
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const environment = await this.prisma.environment.findUnique({
      where: {
        id: environmentId,
      },
    });
    if (!environment) {
      throw new NotFoundException('Environment not found');
    }
    const rawApiKey = crypto.randomBytes(32).toString('hex');

    const rawApiKeyWithPrefix = `${this.apiKeyPrefix}-${type.toLowerCase()}-${rawApiKey}`;

    const apiKeyHash = crypto
      .createHash('sha256')
      .update(rawApiKeyWithPrefix)
      .digest('hex');

    const normalizeAllowedOrigins = allowedOrigins?.map((origin) => {
      return origin.toLowerCase();
    });

    const newApiKey = await this.prisma.apiKey.create({
      data: {
        name,
        keyHash: apiKeyHash,
        previewKey: truncateString(rawApiKeyWithPrefix),
        type,
        allowedOrigins: normalizeAllowedOrigins,
        project: {
          connect: {
            id: project.id,
          },
        },
        environmentId: environment.id,
      },
    });

    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.CREATE,
      resourceType: ResourceType.API_KEY,
      resourceId: newApiKey.id,
      metadata: AuditMetadata.build()
        .withEnvironment({
          id: environment.id,
          name: environment.name,
        })
        .with({
          allowedOrigins: allowedOrigins.join(', '),
        })
        .toJSON(),
    });
    return {
      key: rawApiKeyWithPrefix,
    };
  }

  async revokeByKeyId(currentUser: User, projectId: string, keyId: string) {
    if (!projectId || !keyId) {
      throw new BadRequestException('Missing required parameters');
    }
    const project = await this.getProjectByIdOrSlug(projectId);
    const updatedApiKey = await this.prisma.apiKey.update({
      where: {
        id: keyId,
        projectId: project.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const environment = await this.prisma.environment.findFirst({
      where: {
        id: updatedApiKey.environmentId,
      },
    });
    await this.auditLogService.logAction({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: currentUser.id,
      action: AuditAction.REVOKE,
      resourceType: ResourceType.API_KEY,
      resourceId: updatedApiKey.id,
      metadata: AuditMetadata.build()
        .withEnvironment({
          id: environment.id,
          name: environment.name,
        })
        .toJSON(),
    });

    return updatedApiKey;
  }

  async deleteApiKeyByKeyId(projectId: string, keyId: string) {
    if (!projectId || !keyId) {
      throw new BadRequestException('Missing required parameters');
    }
    const project = await this.getProjectByIdOrSlug(projectId);

    return this.prisma.$transaction(async (tx) => {
      const apiKey = await tx.apiKey.findFirst({
        where: { id: keyId, projectId: project.id },
      });

      if (!apiKey) {
        throw new NotFoundException('API key not found');
      }

      await tx.apiKey.update({
        where: { id: keyId },
        data: { environmentId: null },
      });

      return tx.apiKey.delete({
        where: { id: keyId },
      });
    });
  }

  async findAllKeysByProjectId(projectId: string) {
    const project = await this.getProjectByIdOrSlug(projectId);
    const environments = await this.prisma.environment.findMany({
      where: {
        projectId: project.id,
      },
    });

    const envMap = new Map(environments.map((env) => [env.id, env.name]));
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        projectId: project.id,
      },
      orderBy: [
        {
          revokedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
    return apiKeys.map((apiKey) =>
      this.getApiKeyType(apiKey, envMap.get(apiKey.environmentId) || ''),
    );
  }

  getApiKeyType(apiKey: ApiKey, environmentName: string): ApiKeyBasic {
    return {
      id: apiKey.id,
      key: apiKey.previewKey,
      name: apiKey.name,
      type: apiKey.type,
      projectId: apiKey.projectId,
      allowedOrigins: apiKey.allowedOrigins?.join(', ') || '',
      environmentId: apiKey.environmentId,
      environmentName,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
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
}
