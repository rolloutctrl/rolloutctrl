import {
  ActionIcon as MantineActionButton,
  Badge,
  Collapse,
  Table,
  Text,
  Tooltip,
  CopyButton,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { buildAuditLogCaption, type AuditLog } from '@/entities/AuditLog';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
} from '@tabler/icons-react';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'pink',
  ENABLE: 'teal',
  DISABLE: 'orange',
  REVOKE: 'pink',
};

type AuditLogTableItemProps = {
  auditLog: AuditLog;
};

export const AuditLogTableItem = ({ auditLog }: AuditLogTableItemProps) => {
  const [opened, { toggle }] = useDisclosure(false);

  const colSpan = 6;

  return (
    <>
      <Table.Tr>
        <Table.Td ta="left" w={300}>
          <div className="flex flex-row items-center gap-x-2">
            <MantineActionButton
              type="button"
              aria-label="Show metadata"
              variant="subtle"
              color="gray"
              size="md"
              onClick={toggle}
            >
              {opened ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </MantineActionButton>
            <div className="flex flex-col gap-1">
              <Text size="sm" fw={500}>
                {buildAuditLogCaption(auditLog)}
              </Text>
            </div>
          </div>
        </Table.Td>
        <Table.Td ta="left">
          <div className="flex flex-col py-2">
            {auditLog.user ? (
              <>
                <Text size="sm" fw={500}>
                  {auditLog.user?.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {auditLog.user.email}
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </div>
        </Table.Td>
        <Table.Td ta="left">
          <Badge
            size="sm"
            variant="light"
            color={ACTION_COLOR[auditLog.action] ?? 'gray'}
          >
            {auditLog.action}
          </Badge>
        </Table.Td>
        <Table.Td ta="left">
          <Badge size="sm" variant="light" color="gray">
            {auditLog.resourceType}
          </Badge>
        </Table.Td>
        <Table.Td ta="left">
          <Group gap="xs" wrap="nowrap" align="center">
            <CopyButton value={auditLog.resourceId} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? 'Copied' : 'Copy'}
                  withArrow
                  position="right"
                >
                  <MantineActionButton
                    color={copied ? 'rollout' : 'gray'}
                    variant="subtle"
                    onClick={copy}
                    size="xs"
                  >
                    {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  </MantineActionButton>
                </Tooltip>
              )}
            </CopyButton>
            <Tooltip
              label={auditLog.resourceId}
              disabled={auditLog.resourceId.length <= 24}
            >
              <Text
                size="sm"
                style={{ fontFamily: 'monospace' }}
                truncate="end"
                maw={200}
              >
                {auditLog.resourceId}
              </Text>
            </Tooltip>
          </Group>
        </Table.Td>
        <Table.Td ta="left">
          <Text size="sm">
            {dayjs(auditLog.createdAt).format('DD MMM YYYY HH:mm')}
          </Text>
        </Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={colSpan} p={0} style={{ borderBottom: 'none' }}>
          <Collapse expanded={opened}>
            <Text
              size="xs"
              py="xs"
              style={{ fontFamily: 'monospace' }}
              c="dimmed"
              ta="left"
            >
              {JSON.stringify(auditLog.metadata)}
            </Text>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  );
};
