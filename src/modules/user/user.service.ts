import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRequestDto } from './dto/create.dto';
import { ConfigService } from '@nestjs/config';
import { createAvatar } from '@dicebear/core';
import * as shapes from '@dicebear/shapes';
import { TeamRolePermissions } from 'src/common/constants/permissions.constants';
import { User } from 'src/common/generated/prisma/client';
import { OrganizationRole } from 'src/common/generated/prisma/enums';
import { UpdateUserRequestDto } from './dto/update.dto';
import { ChangePasswordRequestDto } from './dto/change-password.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser({
    email,
    password,
    name,
    role,
    organizationId,
    projects,
  }: CreateUserRequestDto) {
    const saltRounds = parseInt(
      this.configService.getOrThrow<string>('USER_PASSWORD_SALT_ROUNDS') || '5',
    );
    if (Number.isNaN(saltRounds))
      throw new BadRequestException(
        'USER_PASSWORD_SALT_ROUNDS parameter must be an integer!',
      );

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const avatar = createAvatar(shapes, { seed: email });
    const avatarSvg = avatar.toDataUri();

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        organizationRole: role,
        organizationId,
        avatar: avatarSvg,
        joinedAt: new Date(),
      },
    });

    if (projects && projects.length > 0) {
      for (const project of projects) {
        await this.prisma.projectMember.create({
          data: {
            userId: user.id,
            projectId: project.projectId,
            role: project.teamRole,
          },
        });
      }
    }

    return user;
  }

  async updateUser(currentUser: User, dto: UpdateUserRequestDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: currentUser.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: dto.name,
        bio: dto.bio,
      },
    });
  }

  async changePassword(currentUser: User, dto: ChangePasswordRequestDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: currentUser.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await this.getPasswordHash(dto.password);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
      },
    });
  }

  async deleteUser(currentUser: User, req: Request) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: currentUser.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.organizationRole === OrganizationRole.OWNER &&
      user.organizationId
    ) {
      const ownerCount = await this.prisma.user.count({
        where: {
          organizationId: user.organizationId,
          organizationRole: OrganizationRole.OWNER,
          isActive: true,
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot delete the last owner of the organization. Transfer ownership first.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      }),
    ]);

    const logOutCookie = this.authService.getCookiesForLogOut();
    req.res?.setHeader('Set-Cookie', logOutCookie);

    return { success: true };
  }

  async getPasswordHash(password: string) {
    const saltRounds = parseInt(
      this.configService.getOrThrow<string>('USER_PASSWORD_SALT_ROUNDS') || '5',
    );
    if (Number.isNaN(saltRounds))
      throw new BadRequestException(
        'USER_PASSWORD_SALT_ROUNDS parameter must be an integer!',
      );

    return await bcrypt.hash(password, saltRounds);
  }

  async getRolesWithPermissions() {
    return Object.entries(TeamRolePermissions).map(([key, value]) => ({
      role: key,
      permissions: value,
    }));
  }
}
