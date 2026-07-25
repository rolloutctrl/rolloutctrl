import {
  Avatar,
  Badge,
  Group,
  ActionIcon as MantineActionButton,
  Menu,
  Table,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import dayjs from 'dayjs';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { OrganizationRole, PermissionCode } from '@/shared/types/enums';
import type { User } from '@/entities/User';

type OrganizationMemberTableItemProps = {
  member: User;
  onEditMember: (member: User) => void;
  onDeleteMember: (member: User) => void;
};

export const OrganizationMemberTableItem = ({
  member,
  onEditMember,
  onDeleteMember,
}: OrganizationMemberTableItemProps) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Table.Tr>
      <Table.Td>
        <Group>
          <Avatar src={member?.avatar} size={36} radius="xl" />

          <div className="flex flex-col items-start">
            <div className="flex flex-row items-center gap-x-2">
              <Text size="sm" fw={500}>
                {member?.name}
              </Text>
              <Badge
                size="xs"
                variant="dot"
                color={
                  member?.organizationRole === OrganizationRole.OWNER
                    ? 'rollout'
                    : 'orange'
                }
              >
                {member.organizationRole}
              </Badge>
            </div>

            <Text c="dimmed" size="xs">
              {member?.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td className="text-left">
        <div className="flex flex-row flex-wrap gap-2">
          {member.projectMembers.map((projectMember) => (
            <Badge
              key={projectMember.id}
              variant="outline"
              color="rollout"
              size="sm"
            >
              {projectMember.project?.name} - {projectMember.role}
            </Badge>
          ))}
        </div>
      </Table.Td>
      <Table.Td className="text-left">
        <div className="flex flex-col items-start">
          {dayjs(member.joinedAt).format('DD MMM YYYY HH:mm')}
        </div>
      </Table.Td>
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
              permissions={PermissionCode.ORG_MEMBERS_UPDATE}
            >
              <Menu.Item
                leftSection={<IconPencil size={14} />}
                onClick={() => onEditMember(member)}
              >
                Edit
              </Menu.Item>
            </RequiredProjectPermissionsWrapper>

            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.ORG_MEMBERS_REMOVE}
            >
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onDeleteMember(member)}
              >
                Delete
              </Menu.Item>
            </RequiredProjectPermissionsWrapper>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
};
