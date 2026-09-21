import { UserMenuButton } from '@/entities/User/ui/UserMenuButton';
import { LogoutMenuButton } from '@/features/Auth/Logout';
import { SearchInProjectSpotlight } from '@/features/Project/SearchInProjectSpotlight';
import { ToggleNavBar } from '@/features/Theme/ToggleNavBar';
import { ToggleThemeButton } from '@/features/Theme/ToggleTheme';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { Logo } from '@/shared/ui';
import { NotificationsDrawer } from '@/widgets/Notification/NotificationDrawer';
import { AppShell, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';

type HeaderProps = {
  withoutNavBar?: boolean;
};

export const Header = ({ withoutNavBar = false }: HeaderProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  if (withoutNavBar) {
    return (
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center" w="100%">
          <Group>
            <Link to={navigationRoutes.home}>
              <Logo isMini={isMobile} />
            </Link>
          </Group>
          <Group gap="xs">
            <NotificationsDrawer />
            <ToggleThemeButton />
            <UserMenuButton logoutButtonSlot={<LogoutMenuButton />} />
          </Group>
        </Group>
      </AppShell.Header>
    );
  }
  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between" align="center" w="100%">
        {/* <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /> */}
        {/* <TextInput
          placeholder="Search"
          leftSection={<IconSearch size={16} />}
        /> */}
        <Group gap="xs">
          <ToggleNavBar />
          {!isMobile && <SearchInProjectSpotlight />}
        </Group>
        
        <Group gap="xs">
          <NotificationsDrawer />
          <ToggleThemeButton />
          <UserMenuButton
            logoutButtonSlot={<LogoutMenuButton label="Sign out" />}
          />
        </Group>
      </Group>
    </AppShell.Header>
  );
};
