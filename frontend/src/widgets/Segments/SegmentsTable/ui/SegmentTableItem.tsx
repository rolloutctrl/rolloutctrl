import {
  ActionIcon as MantineActionButton,
  Badge,
  Group,
  Stack,
  Table,
  Text,
  Menu,
  type MantineColorScheme,
} from '@mantine/core';
import dayjs from 'dayjs';
import type { Segment } from '../../../../entities/Segment/model/types';
import { IconCopy, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { OPERATOR_CONFIG } from '@/shared/constants/consts';
import type { Operator } from '@/shared/types/enums';

type SegmentTableItemProps = {
  segment: Segment;
  colorScheme: MantineColorScheme;
  onEditSegment: (segment: Segment) => void;
  onDeleteSegment: (segment: Segment) => void;
  onCopySegment: (segment: Segment) => void;
  isCopySegmentDisabled: boolean;
};

const RuleOperatorBadge = ({ operator, not }: { operator: Operator; not?: boolean }) => {
  const config = OPERATOR_CONFIG[operator];
  const operatorLabel = not ? config.notLabel : config.label;
  return (
    <Badge size="xs" variant="dot" color={not ? 'red' : 'blue'}>
      {operatorLabel}
    </Badge>
  );
};

export const SegmentTableItem = ({
  segment,
  colorScheme,
  onEditSegment,
  onDeleteSegment,
  onCopySegment,
  isCopySegmentDisabled,
}: SegmentTableItemProps) => {
  return (
    <Table.Tr>
      <Table.Td>
        <div className="flex flex-col items-start gap-1 py-4">
          <Text
            type="button"
            component={'button'}
            onClick={() => onEditSegment(segment)}
            className="cursor-pointer"
            size="md"
            fw={600}
          >
            {segment.name}
          </Text>
        </div>
      </Table.Td>
      <Table.Td className="text-left">
        <Text size="sm">{segment.key}</Text>
      </Table.Td>
      <Table.Td className="text-left">
        <Stack gap="xs">
          {segment.rules.map((rule) => (
            <Group key={rule.id} gap="xs" wrap="wrap">
              <Text size="xs" fw={500}>
                {rule.field}
              </Text>
              <RuleOperatorBadge operator={rule.operator} not={rule.not} />
              <Text size="xs" c="dimmed">
                {typeof rule.value === 'string'
                  ? rule.value
                  : JSON.stringify(rule.value)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Table.Td>
      <Table.Td className="text-left">
        {dayjs(segment.updatedAt).format('DD MMM YYYY HH:mm')}
      </Table.Td>
      <RequiredProjectPermissionsWrapper
        permissions={PermissionCode.SEGMENT_UPDATE}
      >
        <Table.Td className="text-right">
          <Menu shadow="none" width={180} position="bottom-end">
            <Menu.Target>
              <MantineActionButton
                variant={colorScheme === "light" ? "light" : "subtle"}
                size="md"
                color="gray"
                aria-label="Feature Flag actions"
              >
                <IconDotsVertical size={14} />
              </MantineActionButton>
            </Menu.Target>
            <Menu.Dropdown>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.SEGMENT_UPDATE}
              >
                <Menu.Item
                  leftSection={<IconPencil size={14}  />}
                  onClick={() => onEditSegment(segment)}
                >
                  Edit
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.SEGMENT_UPDATE}
              >
                <Menu.Item
                  leftSection={<IconCopy size={14}  />}
                  onClick={() => onCopySegment(segment)}
                  disabled={isCopySegmentDisabled}
                >
                  Copy to project
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.SEGMENT_DELETE}
              >
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14}  />}
                  onClick={() => onDeleteSegment(segment)}
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
