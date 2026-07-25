import { Alert, Button, Loader, Modal, Text, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { useParams } from 'react-router-dom';
import { useRevokeApiKeyApi } from '../api/useRevokeApiKeyApi';
import type { ApiKeyBasic } from '@/entities/Project';
import type { Nullable } from '@/shared/types/types';

type RevokeApiKeyDialogProps = {
  apiKey?: Nullable<ApiKeyBasic>;
  opened: boolean;
  onClose: () => void;
};

export const RevokeApiKeyDialog = ({
  apiKey,
  opened,
  onClose,
}: RevokeApiKeyDialogProps) => {
  const { projectId } = useParams();
  const { colorScheme } = useMantineColorScheme();
  const { mutateAsync, isPending: isRevoking } = useRevokeApiKeyApi(projectId);

  const handleRevoke = async () => {
    if (!apiKey?.id) return;
    try {
      await mutateAsync(apiKey.id);
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };
  return (
    <Modal opened={opened} onClose={onClose} title="Revoke API key" size="lg">
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to revoke this API key:{' '}
          <strong>{apiKey?.key}</strong>?
        </Text>
        <Alert
          variant={colorScheme === 'light' ? 'filled' : 'light'}
          color="red"
          title="Warning"
          icon={<IconAlertCircle size={16}  />}
        >
          <Text size="sm">This action cannot be undone. If you proceed to use this key afterwards, the runtime environment will malfunction.</Text>
        </Alert>
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isRevoking}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="light"
            onClick={handleRevoke}
            color="red"
            disabled={isRevoking}
          >
            {isRevoking ? <Loader size="xs" color="white" /> : 'Revoke'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
