import { useGetProjectApiKeys } from '@/entities/Project';
import { useDeleteApiKeyApi } from '@/features/ApiKey/DeleteApiKey';
import { useRevokeApiKeyApi } from '@/features/ApiKey/RevokeApiKey';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import {
  Badge,
  Button,
  Divider,
  Grid,
  Loader,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconKey, IconAlertCircle, IconTrash, IconX } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

export const ApiKeysContainer = () => {
  const { projectId } = useParams();
  const { data: apiKeys, isLoading, isError } = useGetProjectApiKeys(projectId || '');
  const { mutateAsync: revokeKey, isPending: isRevoking } = useRevokeApiKeyApi(
    projectId || ''
  );
  const { mutateAsync: deleteKey, isPending: isDeleting } = useDeleteApiKeyApi(
    projectId || ''
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader size="sm" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-red-500">
        <IconAlertCircle size={18} />
        <Text size="sm" c="red">
          Failed to load API keys
        </Text>
      </div>
    );
  }

  if (!apiKeys?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-gray-400">
        <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
          <IconKey size={20} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">
          No API keys yet
        </Text>
      </div>
    );
  }

  return (
    <Stack gap={0}>
      {apiKeys.map((apiKey, index) => {
        const isRevoked = !!apiKey.revokedAt;
        return (
          <div key={apiKey.id}>
            {index > 0 && <Divider />}
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <Grid columns={24} w="100%">
                <Grid.Col span={8}>
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <ThemeIcon
                      variant="light"
                      color={isRevoked ? 'gray' : 'blue'}
                      size="md"
                      radius="md"
                    >
                      <IconKey size={14} />
                    </ThemeIcon>
                    <div className="flex flex-col min-w-0">
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color="gray" variant="outline" size="xs">
                          {apiKey.environmentName}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          Created{' '}
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </Text>
                        {isRevoked && apiKey.revokedAt && (
                          <Text size="xs" c="red">
                            Revoked{' '}
                            {new Date(apiKey.revokedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="sm" fw={600}>
                    {apiKey.key}
                  </Text>
                </Grid.Col>
                <Grid.Col span={8} ta="right">
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
                        disabled={isRevoked || isRevoking}
                        onClick={() => revokeKey(apiKey.id)}
                        leftSection={<IconX size={14}  />}
                      >
                        Revoke
                      </Button>
                    )}
                  </RequiredProjectPermissionsWrapper>
                </Grid.Col>
              </Grid>
            </div>
          </div>
        );
      })}
    </Stack>
  );
};
