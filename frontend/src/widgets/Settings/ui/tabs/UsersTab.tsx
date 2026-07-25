import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { AddOrganizationMemberButton } from '@/features/Organization/AddOrganizationMember';
import { PermissionCode } from '@/shared/types/enums';
import { OrganizationMembersTable } from '@/widgets/Organization/OrganizationMembersTable';
import { Box, Title } from '@mantine/core';

export const UsersTab = () => {
  return (
    <RequiredProjectPermissionsWrapper
      redirect
      permissions={PermissionCode.ORG_MEMBERS_READ}
    >
      <Box
        w="100%"
        p="md"
        className="flex flex-row w-full items-center justify-between gap-x-2"
      >
        <Title order={2} size="lg">
          Users
        </Title>
        <RequiredProjectPermissionsWrapper
          permissions={PermissionCode.ORG_MEMBERS_INVITE}
        >
          <AddOrganizationMemberButton />
        </RequiredProjectPermissionsWrapper>
      </Box>
      <OrganizationMembersTable />
    </RequiredProjectPermissionsWrapper>
  );
};
