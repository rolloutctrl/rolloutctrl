import {
  Badge,
  Indicator,
  ActionIcon as MantineActionButton,
  Menu,
  Table,
  Text,
  Tooltip,
  type MantineColorScheme,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import { ToggleFlagFavorite } from '@/features/FeatureFlag/ToggleFlagFavorite';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { sortFlagEnvProductionFirst } from '@/entities/FeatureFlagEnvironment';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

type FeatureFlagTableItemProps = {
  featureFlag: FeatureFlag;
  onEditFeatureFlag: (flag: FeatureFlag) => void;
  onDeleteFeatureFlag: (flag: FeatureFlag) => void;
  colorScheme: MantineColorScheme;
};

export const FeatureFlagTableItem = ({
  featureFlag,
  onEditFeatureFlag,
  onDeleteFeatureFlag,
  colorScheme,
}: FeatureFlagTableItemProps) => {
  const isActive = featureFlag?.environments.some((env) => env.enabled);
  return (
    <Table.Tr>
      <Table.Td>
        <div className="flex flex-row items-center gap-2 py-4 text-left">
          {!featureFlag.archived && (
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.FLAG_UPDATE}
            >
              <ToggleFlagFavorite
                projectId={featureFlag.project.slug}
                featureFlag={featureFlag}
              />
            </RequiredProjectPermissionsWrapper>
          )}
          <Text
            component={Link}
            to={`/project/${featureFlag.project.slug}/feature-flags/${featureFlag.key}`}
            fw={600}
            className="hover:!text-rollout transition-colors cursor-pointer"
          >
            {featureFlag.key}
          </Text>
          {isActive && (
            <Tooltip label="This feature flag is active">
              <Indicator size={8} className="ml-1" zIndex={10} />
            </Tooltip>
          )}
        </div>
      </Table.Td>
      <Table.Td className="text-left">
        <div className="flex flex-row flex-wrap gap-2">
          {sortFlagEnvProductionFirst(featureFlag.environments).map((env) => (
            <Tooltip
              key={env.environment.id}
              label={`${env.environment.name} - ${env.enabled ? 'Enabled' : 'Disabled'}`}
            >
              <Badge
                size="sm"
                variant="dot"
                color={env.enabled ? 'rollout' : 'gray'}
              >
                {env.environment.name}
              </Badge>
            </Tooltip>
          ))}
        </div>
      </Table.Td>
      <Table.Td className="text-left">
        {dayjs(featureFlag.createdAt).format('DD MMM YYYY HH:mm')}
      </Table.Td>
      <RequiredProjectPermissionsWrapper
        permissions={PermissionCode.FLAG_UPDATE}
      >
        <Table.Td className="text-center">
          <Menu shadow="none" width={120} position="bottom-end">
            <Menu.Target>
              <MantineActionButton
                variant={colorScheme === 'light' ? 'light' : 'subtle'}
                size="md"
                color="gray"
                aria-label="Feature Flag actions"
              >
                <IconDotsVertical size={14} />
              </MantineActionButton>
            </Menu.Target>
            <Menu.Dropdown>
              <RequiredProjectPermissionsWrapper
                permissions={[PermissionCode.FLAG_UPDATE]}
              >
                <Menu.Item
                  leftSection={<IconPencil size={14} />}
                  onClick={() => onEditFeatureFlag(featureFlag)}
                >
                  Edit
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.FLAG_DELETE}
              >
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onDeleteFeatureFlag(featureFlag)}
                >
                  Delete
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </RequiredProjectPermissionsWrapper>
    </Table.Tr>
  );
};
