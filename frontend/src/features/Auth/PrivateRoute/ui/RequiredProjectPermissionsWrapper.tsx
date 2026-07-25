import { useGetCurrentUser, useGetRolesWithPermissions } from '@/entities/User';
import { checkUserPermissions } from '@/shared/utils/checkUserPermissions';
import { OrganizationRole, type PermissionCode } from '@/shared/types/enums';
import { useParams } from 'react-router-dom';
import { WildcardNavigate } from './WildcardNavigate';

type RequiredProjectPermissionsWrapperProps = {
  permissions: PermissionCode[] | PermissionCode;
  placeholder?: React.ReactNode;
  redirect?: boolean;
  bypass?: boolean;
  children: React.ReactNode;
};

export const RequiredProjectPermissionsWrapper = ({
  children,
  permissions,
  redirect,
  placeholder,
  bypass,
}: RequiredProjectPermissionsWrapperProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: currentUser } = useGetCurrentUser();
  const { data: teamRoles } = useGetRolesWithPermissions();

  if (bypass) {
    return <>{children}</>;
  }

  if (!currentUser || !teamRoles) {
    return null;
  }

  const organizationUserRole = currentUser?.organizationRole;

  const projectMember = currentUser.projectMembers.find(
    (pm) => pm.projectId === projectId || pm.project?.slug === projectId,
  );

  const userPermissions = projectMember
    ? ((teamRoles.find((r) => r.role === projectMember.role)?.permissions ??
        []) as PermissionCode[])
    : [];

  if (
    !checkUserPermissions(
      organizationUserRole || OrganizationRole.MEMBER,
      userPermissions,
      permissions,
    )
  ) {
    if (redirect) {
      return <WildcardNavigate />;
    }
    return <>{placeholder ?? null}</>;
  }

  return <>{children}</>;
};
