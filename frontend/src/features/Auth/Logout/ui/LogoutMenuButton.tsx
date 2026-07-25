import { Menu } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useLogoutApi } from '../api/useLogoutApi';

type LogoutMenuButtonProps = {
  label?: string;
};

export const LogoutMenuButton = ({
  label = 'Logout',
}: LogoutMenuButtonProps) => {
  const { logout, isPending } = useLogoutApi();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <Menu.Item
      component='button'
      type='button'
      leftSection={<IconLogout size={14} />}
      onClick={handleLogout}
      disabled={isPending}
    >
      {label}
    </Menu.Item>
  );
};
