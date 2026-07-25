import { Alert, Button, Loader, Modal, Text } from '@mantine/core';
import { useDeleteEnvironmentApi } from '../api/useDeleteEnvironmentApi';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import type { EnvironmentWithCounts } from '@/entities/Environment/model/types';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

type DeleteEnvironmentDialogProps = {
  environment?: EnvironmentWithCounts | null;
  opened: boolean;
  onClose: () => void;
};

export const DeleteEnvironmentDialog = ({
  environment,
  opened,
  onClose,
}: DeleteEnvironmentDialogProps) => {
  const projectId = environment?.project?.slug ?? '';
  const environmentId = environment?.id ?? '';
  const environmentName = environment?.name ?? '';
  const { mutateAsync, isPending } = useDeleteEnvironmentApi(
    environmentName,
    projectId,
  );

  const hasEabledFlags = (environment?.enabledFlagsCount ?? 0) > 0;

  const handleDeleteFeatureFlag = async () => {
    try {
      await mutateAsync(environmentId);
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete environment: ${environmentName}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this environment:{' '}
          <strong>{environmentName}</strong>?
        </Text>
        {hasEabledFlags && (
          <Alert
            variant="filled"
            color="red"
            title="Warning: Environment has enabled flags"
            icon={<IconAlertCircle size={16}  />}
          >
            <Text size="sm">
              This environment has{' '}
              <strong>{environment?.enabledFlagsCount}</strong> enabled flags.
            </Text>
          </Alert>
        )}
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="light"
            onClick={handleDeleteFeatureFlag}
            color="red"
            disabled={isPending || environment?.isSystem}
          >
            {isPending ? <Loader size="xs" color="white" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
