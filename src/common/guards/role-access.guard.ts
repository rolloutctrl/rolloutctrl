import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import {
  OrganizationRolePermissions,
  PermissionCode,
  TeamRolePermissions,
} from '../constants/permissions.constants';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/required-permissions.decorator';
import { TeamRole } from '../generated/prisma/enums';

type ProjectMemberEntry = {
  projectId: string;
  role: string;
  project: { id: string; slug: string };
};

@Injectable()
export class RoleAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionCode[]
    >(REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const jwtUser = request.user;

    if (!jwtUser) {
      throw new UnauthorizedException();
    }

    const user = jwtUser.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const organizationId = user.organizationId;

    const projectId: string | undefined =
      request.params?.projectId ||
      request.body?.projectId ||
      request.query?.projectId ||
      (request.headers['x-project-id'] as string | undefined);

    const userBelongsToOrg = user.organizationId === organizationId;

    if (userBelongsToOrg) {
      const orgPermissions =
        OrganizationRolePermissions[user.organizationRole] ?? [];

      const hasOrgPermissions = requiredPermissions.every((permission) =>
        orgPermissions.includes(permission),
      );

      if (hasOrgPermissions) {
        request.organizationRole = user.organizationRole;
        request.organizationId = organizationId;
        request.projectId = projectId;
        return true;
      }
    }

    if (!projectId) {
      if (!userBelongsToOrg) {
        throw new ForbiddenException('No membership in this organization');
      }
      throw new ForbiddenException('Insufficient permissions');
    }

    const projectMembers: ProjectMemberEntry[] = user.projectMembers ?? [];
    const projectMember = projectMembers.find(
      (pm) => pm.projectId === projectId || pm.project?.slug === projectId,
    );

    if (!projectMember) {
      throw new ForbiddenException('Project access denied');
    }

    const permissions = TeamRolePermissions[projectMember.role as TeamRole];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.projectMember = projectMember;
    request.projectId = projectId;

    return true;
  }
}
