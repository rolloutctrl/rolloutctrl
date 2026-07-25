import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createAvatar } from '@dicebear/core';
import * as shapes from '@dicebear/shapes';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { OrganizationRole } from 'src/common/generated/prisma/enums';

import {
  AddOrganizationUserRequestDto,
  UpdateOrganizationRequestDto,
} from './dto';
import { TransferOwnershipRequestDto } from './dto/transfer-ownership.dto';
import { UpdateOrganizationUserRequestDto } from './dto/update-organization-user.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getMyOrganization(userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { users: { some: { id: userId } } },
    });

    return organization;
  }

  async findById(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      return null;
    }

    const { _count, ...rest } = organization;
    return {
      ...rest,
      totalMembers: _count.users,
      totalProjects: _count.projects,
    };
  }

  async updateOrganization(
    organizationId: string,
    dto: UpdateOrganizationRequestDto,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: dto.name,
        url: dto.url,
        description: dto.description,
      },
    });
  }

  async getOrganizationMembers(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          where: {
            isActive: true,
          },
          omit: { password: true },
          include: {
            projectMembers: {
              where: {
                project: { organizationId },
              },
              include: { project: true },
            },
          },
        },
      },
    });

    if (!organization) throw new NotFoundException('Organization not found');

    return organization.users;
  }

  async addUserToOrganization(
    organizationId: string,
    dto: AddOrganizationUserRequestDto,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordHash = await this.userService.getPasswordHash(dto.password);
    const avatar = createAvatar(shapes, { seed: dto.email });
    const avatarSvg = avatar.toDataUri();

    const projectAssignments = dto.projects || [];

    return this.prisma.$transaction(async (tx) => {
      let user;

      if (existingUser) {
        if (existingUser.isActive) {
          throw new BadRequestException('User with this email already exists');
        }

        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            email: dto.email,
            password: passwordHash,
            name: dto.name,
            organizationRole: dto.role,
            organizationId,
            avatar: avatarSvg,
            isActive: true,
            joinedAt: new Date(),
          },
        });
      } else {
        user = await tx.user.create({
          data: {
            email: dto.email,
            password: passwordHash,
            name: dto.name,
            organizationRole: dto.role,
            organizationId,
            avatar: avatarSvg,
            joinedAt: new Date(),
          },
        });
      }

      if (projectAssignments.length > 0) {
        const orgProjects = await tx.project.findMany({
          where: { organizationId },
          select: { id: true, slug: true },
        });
        const projectLookup = new Map<string, string>();
        for (const p of orgProjects) {
          projectLookup.set(p.id, p.id);
          projectLookup.set(p.slug, p.id);
        }

        for (const assignment of projectAssignments) {
          const resolvedProjectId = projectLookup.get(assignment.projectId);
          if (!resolvedProjectId) {
            throw new BadRequestException(
              `Project ${assignment.projectId} does not belong to this organization`,
            );
          }
          await tx.projectMember.upsert({
            where: {
              projectId_userId: {
                projectId: resolvedProjectId,
                userId: user.id,
              },
            },
            update: { role: assignment.teamRole },
            create: {
              userId: user.id,
              projectId: resolvedProjectId,
              role: assignment.teamRole,
            },
          });
        }
      }

      return user;
    });
  }

  async updateOrganizationRole(
    organizationId: string,
    userId: string,
    dto: UpdateOrganizationUserRequestDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.organizationRole === OrganizationRole.OWNER &&
      dto.role !== OrganizationRole.OWNER
    ) {
      const ownerCount = await this.prisma.organization.count({
        where: {
          id: organizationId,
          users: {
            some: {
              organizationRole: OrganizationRole.OWNER,
              isActive: true,
            },
          },
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last owner of the organization',
        );
      }
    }

    const newProjectAssignments = dto.projects || [];

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this.userService.getPasswordHash(dto.password);
    }

    return this.prisma.$transaction(async (tx) => {
      const orgProjects = await tx.project.findMany({
        where: { organizationId },
        select: { id: true, slug: true },
      });
      const projectLookup = new Map<string, string>();
      for (const p of orgProjects) {
        projectLookup.set(p.id, p.id);
        projectLookup.set(p.slug, p.id);
      }
      const orgProjectIds = orgProjects.map((p) => p.id);

      const resolvedAssignments = newProjectAssignments.map((a) => {
        const resolvedProjectId = projectLookup.get(a.projectId);
        if (!resolvedProjectId) {
          throw new BadRequestException(
            `Project ${a.projectId} does not belong to this organization`,
          );
        }
        return { ...a, projectId: resolvedProjectId };
      });
      const newProjectIds = resolvedAssignments.map((p) => p.projectId);

      const existingMembers = await tx.projectMember.findMany({
        where: { userId, projectId: { in: orgProjectIds } },
        select: { projectId: true },
      });
      const existingProjectIds = existingMembers.map((m) => m.projectId);
      const projectIdsToRemove = existingProjectIds.filter(
        (id) => !newProjectIds.includes(id),
      );

      if (projectIdsToRemove.length > 0) {
        await tx.projectMember.deleteMany({
          where: { userId, projectId: { in: projectIdsToRemove } },
        });
      }

      for (const assignment of resolvedAssignments) {
        await tx.projectMember.upsert({
          where: {
            projectId_userId: { projectId: assignment.projectId, userId },
          },
          update: { role: assignment.teamRole },
          create: {
            projectId: assignment.projectId,
            userId,
            role: assignment.teamRole,
          },
        });
      }

      return tx.user.update({
        where: { id: userId, organizationId },
        data: {
          organizationRole: dto.role,
          name: dto.name,
          email: dto.email,
          ...(passwordHash && { password: passwordHash }),
        },
      });
    });
  }

  async removeMember(
    organizationId: string,
    currentUserId: string,
    targetUserId: string,
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: targetUserId,
        organizationId,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.organizationRole === OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organization.count({
        where: {
          id: organizationId,
          users: {
            some: {
              organizationRole: OrganizationRole.OWNER,
              isActive: true,
            },
          },
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last owner of the organization',
        );
      }
    }

    if (currentUserId === targetUserId) {
      throw new BadRequestException(
        'Cannot remove yourself from the organization',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const orgProjects = await tx.project.findMany({
        where: { organizationId },
        select: { id: true },
      });
      const orgProjectIds = orgProjects.map((p) => p.id);

      if (orgProjectIds.length > 0) {
        await tx.projectMember.deleteMany({
          where: { userId: targetUserId, projectId: { in: orgProjectIds } },
        });
      }

      return tx.user.delete({
        where: {
          id: targetUserId,
          organizationId,
        },
      });
    });
  }

  async transferOwnership(
    organizationId: string,
    currentOwnerId: string,
    dto: TransferOwnershipRequestDto,
  ) {
    const { newOwnerId } = dto;

    if (currentOwnerId === newOwnerId) {
      throw new BadRequestException('New owner must be a different user');
    }

    const [currentOwnerUser, newOwnerUser] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: currentOwnerId,
          organizationId,
        },
      }),
      this.prisma.user.findUnique({
        where: {
          id: newOwnerId,
          organizationId,
        },
      }),
    ]);

    if (
      !currentOwnerUser ||
      currentOwnerUser.organizationRole !== OrganizationRole.OWNER
    ) {
      throw new BadRequestException('Current user is not an owner');
    }

    if (!newOwnerUser) {
      throw new NotFoundException(
        'Target user is not a member of this organization',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: currentOwnerId,
          organizationId,
        },
        data: { organizationRole: OrganizationRole.MEMBER },
      });

      return tx.user.update({
        where: {
          id: newOwnerId,
          organizationId,
        },
        data: { organizationRole: OrganizationRole.OWNER },
      });
    });
  }
}
