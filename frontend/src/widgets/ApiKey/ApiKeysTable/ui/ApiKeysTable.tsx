import { useGetProjectApiKeys, type ApiKeyBasic } from '@/entities/Project';
import { Center, Loader, Table, Text, ThemeIcon } from '@mantine/core';
import { IconKey } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { ApiKeyTableItem } from './ApiKeyTableItem';
import { RevokeApiKeyDialog } from '@/features/ApiKey/RevokeApiKey';
import type { Nullable } from '@/shared/types/types';
import { useState } from 'react';

export const ApiKeysTable = () => {
  const { projectId } = useParams();
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] =
    useState<Nullable<ApiKeyBasic>>(null);
  const { data: apiKeys, isLoading, isError } = useGetProjectApiKeys(projectId);

  const handleOpenRevokeDialog = (apiKey: ApiKeyBasic) => {
    setSelectedApiKey(apiKey);
    setIsRevokeDialogOpen(true);
  };

  const handleCloseRevokeDialog = () => {
    setIsRevokeDialogOpen(false);
    setSelectedApiKey(null);
  };

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center p="xl">
        <Text c="red">Failed to load API keys</Text>
      </Center>
    );
  }

  if (!apiKeys?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10">
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
    <>
      <Table
        classNames={{
          td: '!px-4',
          th: '!px-4',
        }}
      >
        <Table.Thead
          className="bg-gray-100 dark:bg-dark"
          style={{ position: 'sticky', top: 60, zIndex: 100 }}
        >
          <Table.Tr>
            <Table.Th w="300">Name</Table.Th>
            <Table.Th w="100">Type</Table.Th>
            <Table.Th>Key</Table.Th>
            <Table.Th w="150">Environment</Table.Th>
            <Table.Th>Allowed Origins</Table.Th>
            <Table.Th ta="right">Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {apiKeys.map((apiKey) => (
            <ApiKeyTableItem
              key={apiKey.id}
              apiKey={apiKey}
              projectId={projectId ?? ''}
              onRevoke={handleOpenRevokeDialog}
            />
          ))}
        </Table.Tbody>
      </Table>
      <RevokeApiKeyDialog
        apiKey={selectedApiKey}
        opened={isRevokeDialogOpen}
        onClose={handleCloseRevokeDialog}
      />
    </>
  );
};
