import { Alert, Button, Loader, Modal, Text, useMantineColorScheme } from '@mantine/core';
import { useDeleteActionApi } from '../api/useDeleteActionApi';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import type { Action } from '@/entities/Action';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

type DeleteActionDialogProps = {
  action?: Action | null;
  opened: boolean;
  onClose: () => void;
  needRedirect?: boolean;
};

export const DeleteActionDialog = ({
  action,
  opened,
  onClose,
  needRedirect,
}: DeleteActionDialogProps) => {
  const projectId = action?.project?.slug ?? '';
  const actionKey = action?.key ?? '';
  const { colorScheme } = useMantineColorScheme();
  const { mutateAsync, isPending } = useDeleteActionApi(
    actionKey,
    projectId,
    needRedirect,
  );

  const handleDeleteAction = async () => {
    if (!action?.id) return;
    try {
      await mutateAsync(action.id);
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete flag: ${actionKey}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this action:{' '}
          <strong>{actionKey}</strong>?
        </Text>
        {action?.enabled && (
          <Alert
            variant={colorScheme === 'light' ? 'filled' : 'light'}
            color="red"
            title="Warning: Action is active"
            icon={<IconAlertCircle size={16}  />}
          >
            <Text size="sm">
              This action is currently <strong>enabled</strong> in the project
              environments.
            </Text>
            <Text size="sm" color="red" fw={700} className="mt-2">
              Deleting this action may cause runtime errors in environments!
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
            onClick={handleDeleteAction}
            color="red"
            disabled={isPending}
          >
            {isPending ? <Loader size="xs" color="white" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
