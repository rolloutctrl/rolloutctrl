import {
  Indicator,
  ActionIcon as MantineActionButton,
  Menu,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import type { Action } from '@/entities/Action';
import { type MantineColorScheme } from '@mantine/core';

type ActionTableItemProps = {
  action: Action;
  colorScheme: MantineColorScheme;
  onEditAction: (action: Action) => void;
  onDeleteAction: (action: Action) => void;
};

export const ActionTableItem = ({
  action,
  colorScheme,
  onEditAction,
  onDeleteAction,
}: ActionTableItemProps) => {
  const isActive = action?.enabled;
  return (
    <Table.Tr>
      <Table.Td>
        <div className="flex flex-row items-center gap-2 py-4 text-left">
          <Text
            component={Link}
            to={`/project/${action.project.slug}/actions/${action.key}`}
            fw={600}
            className="hover:!text-rollout transition-colors cursor-pointer"
          >
            {action.key}
          </Text>
          {isActive && (
            <Tooltip label="This action is active">
              <Indicator size={8} className="ml-1" />
            </Tooltip>
          )}
        </div>
      </Table.Td>
      <Table.Td className="text-left">
        {dayjs(action.createdAt).format('DD MMM YYYY HH:mm')}
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
                permissions={[PermissionCode.ACTION_UPDATE]}
              >
                <Menu.Item
                  leftSection={<IconPencil size={14}  />}
                  onClick={() => onEditAction(action)}
                >
                  Edit
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.FLAG_DELETE}
              >
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14}  />}
                  onClick={() => onDeleteAction(action)}
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
