import { useAuthContext } from '@/app/providers/AuthProvider';
import {
  Avatar,
  Group,
  Menu,
  Skeleton,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useGetCurrentUser } from '../api/useGetCurrentUser';
import { IconChevronDown, IconUser, IconBuilding } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

type UserMenuButtonProps = {
  logoutButtonSlot?: React.ReactNode;
};

export const UserMenuButton = ({ logoutButtonSlot }: UserMenuButtonProps) => {
  const { isAuthenticated } = useAuthContext();
  const { data: currentUser, isLoading } = useGetCurrentUser(isAuthenticated);

  if (isLoading) {
    return <Skeleton width={40} height={40} radius="xl" />;
  }

  return (
    <Menu shadow="none" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton className="flex flex-row items-center py-2 px-2">
          <Group>
            <Avatar src={currentUser?.avatar} size={30} radius="xl" />

            <div className="flex flex-col items-start">
              <Text size="sm" fw={500}>
                {currentUser?.name}
              </Text>

              <Text c="dimmed" size="xs">
                {currentUser?.email}
              </Text>
            </div>

            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        {/* <Menu.Item leftSection={<GearSixIcon size={14} />}>Settings</Menu.Item> */}
        <Menu.Item
          component={Link}
          to={navigationRoutes.profile}
          leftSection={<IconUser size={14} />}
        >
          Profile
        </Menu.Item>
        {/* <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item> */}
        <RequiredProjectPermissionsWrapper
          permissions={PermissionCode.ORG_MANAGE}
        >
          <Menu.Item
            component={Link}
            to={navigationRoutes.organization}
            leftSection={<IconBuilding size={14} />}
          >
            Organization
          </Menu.Item>
        </RequiredProjectPermissionsWrapper>

        <Menu.Divider />
        {logoutButtonSlot}
      </Menu.Dropdown>
    </Menu>
  );
};
