import { Badge, Button, Table, Text, ThemeIcon } from '@mantine/core';
import { IconKey, IconTrash, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { useDeleteApiKeyApi } from '@/features/ApiKey/DeleteApiKey';
import type { ApiKeyBasic } from '@/entities/Project';

type ApiKeyTableItemProps = {
  apiKey: ApiKeyBasic;
  projectId: string;
  onRevoke: (apiKey: ApiKeyBasic) => void;
};

export const ApiKeyTableItem = ({
  apiKey,
  projectId,
  onRevoke,
}: ApiKeyTableItemProps) => {
  const { mutateAsync: deleteKey, isPending: isDeleting } =
    useDeleteApiKeyApi(projectId);
  const isRevoked = !!apiKey.revokedAt;

  return (
    <Table.Tr>
      <Table.Td>
        <div className="flex items-center gap-3 text-left">
          <ThemeIcon
            variant="light"
            color={isRevoked ? 'gray' : 'blue'}
            size="md"
            radius="md"
          >
            <IconKey size={14} />
          </ThemeIcon>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text size="sm" fw={600}>
                {apiKey.name}
              </Text>
              {isRevoked ? (
                <Badge color="red" variant="light" size="xs">
                  Revoked
                </Badge>
              ) : (
                <Badge color="green" variant="light" size="xs">
                  Active
                </Badge>
              )}
            </div>
            <Text size="xs" c="dimmed">
              Created {dayjs(apiKey.createdAt).format('DD MMM YYYY')}
            </Text>
          </div>
        </div>
      </Table.Td>
      <Table.Td ta="left">
        <Badge color="gray" variant="light" size="sm" className="shrink-0">
          {apiKey.type}
        </Badge>
      </Table.Td>
      <Table.Td ta="left">
        <Text size="sm" style={{ fontFamily: 'monospace' }}>
          {apiKey.key}
        </Text>
      </Table.Td>
      <Table.Td>
        <div className="flex flex-col gap-0.5 items-start text-left">
          <Badge color="gray" variant="light" size="sm">
            {apiKey.environmentName}
          </Badge>
          {isRevoked && apiKey.revokedAt && (
            <Text size="xs" c="red">
              Revoked {dayjs(apiKey.revokedAt).format('DD MMM YYYY')}
            </Text>
          )}
        </div>
      </Table.Td>
      <Table.Td ta="left">
        <Text size="xs" c="dimmed">
          {apiKey.allowedOrigins}
        </Text>
      </Table.Td>
      <Table.Td ta="right">
        <RequiredProjectPermissionsWrapper
          permissions={PermissionCode.API_KEY_REVOKE}
        >
          {apiKey.revokedAt ? (
            <Button
              size="xs"
              variant="light"
              color="red"
              disabled={isDeleting}
              onClick={() => deleteKey(apiKey.id)}
              leftSection={<IconTrash size={14}  />}
            >
              Delete
            </Button>
          ) : (
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => onRevoke(apiKey)}
              leftSection={<IconX size={14}  />}
            >
              Revoke
            </Button>
          )}
        </RequiredProjectPermissionsWrapper>
      </Table.Td>
    </Table.Tr>
  );
};
