/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import {
  Badge,
  Box,
  Collapse,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Link, useMatch } from 'react-router-dom';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import type { PermissionCode } from '@/shared/types/enums';

interface LinkItem {
  label: string;
  link: string;
  needPermission?: PermissionCode;
}

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  link?: string;
  needPermission?: PermissionCode;
  initiallyOpened?: boolean;
  links?: LinkItem[];
  badge?: number;
  exact?: boolean;
  collapsed?: boolean;
  onLinkClick?: () => void;
}

const NavLink = ({ label, link, needPermission, onLinkClick }: LinkItem & { onLinkClick?: () => void }) => {
  const match = useMatch(link);
  const isActive = !!match;

  const content = (
    <Text
      component={Link}
      onClick={onLinkClick}
      className={`flex text-left px-4 !py-2 w-full transition-colors ${
        isActive ? 'text-rollout' : 'text-gray-900 hover:text-rollout'
      }`}
      size="sm"
      fw={isActive ? 600 : 500}
      to={link}
    >
      {label}
    </Text>
  );

  if (needPermission) {
    return (
      <RequiredProjectPermissionsWrapper permissions={needPermission}>
        {content}
      </RequiredProjectPermissionsWrapper>
    );
  }

  return content;
};

type SingleNavLinkProps = {
  icon: React.FC<any>;
  label: string;
  link: string;
  needPermission?: PermissionCode;
  isActive: boolean;
  badge?: number;
  exact?: boolean;
  collapsed?: boolean;
  onLinkClick?: () => void;
};
const SingleNavLink = ({
  icon: Icon,
  label,
  link,
  needPermission,
  isActive,
  badge,
  collapsed,
  onLinkClick,
}: SingleNavLinkProps) => {
  const mainLink = collapsed ? (
    <Tooltip label={label} position="right" withArrow>
      <Box
        component={Link}
        to={link || '#'}
        onClick={onLinkClick}
        className={`flex flex-row w-[34px] items-center justify-center px-2 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-rollout dark:bg-rollout/5 bg-rollout/5'
            : 'text-gray-700 dark:text-gray-300 hover:text-rollout'
        }`}
      >
        <Icon size={18}  className="shrink-0" />
      </Box>
    </Tooltip>
  ) : (
    <Box
      component={Link}
      to={link || '#'}
      onClick={onLinkClick}
      className={`flex flex-row w-full items-center px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'text-rollout dark:bg-rollout/5 bg-rollout/5'
          : 'text-gray-700 dark:text-gray-300 hover:text-rollout'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <Text size="sm" fw={400} ml="md" style={{ flex: 1 }}>
        {label}
      </Text>
      {badge !== undefined && badge > 0 && (
        <Badge size="sm" variant="light" color="gray.4" circle={false} ml="xs">
          {badge}
        </Badge>
      )}
    </Box>
  );
  if (needPermission) {
    return (
      <RequiredProjectPermissionsWrapper permissions={needPermission}>
        {mainLink}
      </RequiredProjectPermissionsWrapper>
    );
  }
  return mainLink;
};

export const LinksGroup = ({
  icon: Icon,
  label,
  initiallyOpened,
  link,
  needPermission,
  links,
  badge,
  exact,
  collapsed,
  onLinkClick,
}: LinksGroupProps) => {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((item) => (
    <NavLink key={item.label} {...item} onLinkClick={onLinkClick} />
  ));

  const match = useMatch({ path: link ?? '', end: exact ?? false });
  const isActive = !!match;

  const mainLink =
    link && !hasLinks ? (
      <SingleNavLink
        icon={Icon}
        label={label}
        link={link}
        isActive={isActive}
        needPermission={needPermission}
        badge={badge}
        exact={exact}
        collapsed={collapsed}
        onLinkClick={onLinkClick}
      />
    ) : null;

  if (mainLink) {
    return mainLink;
  }

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className="font-medium flex w-full !px-4 !py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Group justify="space-between" gap={0} w="100%">
          <Box className="flex items-center">
            <Icon size={18} />
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              stroke={1.5}
              size={16}
              className="transition-transform duration-200"
              style={{ transform: opened ? 'rotate(-90deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? (
        <Collapse expanded={opened}>
          <Stack gap={0} pl={34}>
            {items}
          </Stack>
        </Collapse>
      ) : null}
    </>
  );
};
