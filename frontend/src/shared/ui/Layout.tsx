import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet } from 'react-router-dom';
import { navigationRoutes } from '../routes/navigationRoutes';
import { useToggleNavBar } from '@/features/Theme/ToggleNavBar';
import type React from 'react';
import { Logo } from './icons/Logo';
import clsx from 'clsx';

type LayoutProps = {
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  subscribeDialogsSlot?: React.ReactNode;
  navBarSlot?: React.ReactNode;
  withoutNavBar?: boolean;
  isOnePage?: boolean;
};

export const Layout = ({
  headerSlot,
  footerSlot,
  navBarSlot,
  withoutNavBar = false,
  isOnePage = false,
}: LayoutProps) => {
  const [opened, { toggle }] = useDisclosure();
  // const { colorScheme } = useMantineColorScheme();
  const { collapsed } = useToggleNavBar();
  const navbarWidth = collapsed ? 80 : 255;
  if (isOnePage) {
    return (
      <AppShell
        padding="md"
        classNames={{
          navbar: '!bg-gray-100 dark:!bg-supa-dark !px-2',
          header: '!z-[101] !bg-gray-100 dark:!bg-supa-dark',
          main: 'flex flex-col items-center justify-center bg-gray-100 dark:bg-supa-dark',
          footer: '!bg-gray-100 dark:!bg-supa-dark'
        }}
      >
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        {footerSlot}
      </AppShell>
    );
  }

  if (withoutNavBar) {
    return (
      <AppShell
        header={{ height: 60 }}
        padding="md"
        classNames={{
          navbar: '!bg-gray-100 dark:!bg-supa-dark !px-2',
          header: '!z-[101] !bg-gray-100 dark:!bg-supa-dark',
          main: 'bg-gray-100 dark:bg-supa-dark',
          footer: '!relative !bg-gray-100 dark:!bg-supa-dark',
        }}
      >
        {headerSlot}
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        {footerSlot}
      </AppShell>
    );
  }
  return (
    <AppShell
      layout="alt"
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      header={{ height: 60 }}
      padding="md"
      classNames={{
        navbar: '!bg-gray-100 dark:!bg-supa-dark !px-2',
        main: 'bg-gray-100 dark:bg-supa-dark',
        footer: '!relative !bg-gray-100 dark:!bg-supa-dark',
        header: '!z-[101] !bg-gray-100 dark:!bg-supa-dark',
      }}
    >
      {headerSlot}
      <AppShell.Navbar px="md">
        <Group
          h={60}
          className={clsx(
            'shrink-0 px-2',
            collapsed && 'flex !flex-col !items-center !justify-center',
          )}
          justify="space-between"
          wrap="nowrap"
        >
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link to={navigationRoutes.home}>
            <Logo isMini={collapsed} />
          </Link>
        </Group>
        {navBarSlot}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      {footerSlot}
    </AppShell>
  );
};
