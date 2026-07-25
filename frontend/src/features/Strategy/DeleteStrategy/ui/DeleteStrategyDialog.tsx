import { Button, Loader, Modal, Text } from '@mantine/core';
import { useDeleteStrategyApi } from '../api/useDeleteStrategyApi';
import { notifications } from '@mantine/notifications';
import type { Strategy } from '@/entities/Strategy';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import type { Nullable } from '@/shared/types/types';

type DeleteStrategyDialogProps = {
  strategy: Nullable<Strategy>;
  opened: boolean;
  onClose: () => void;
};

export const DeleteStrategyDialog = ({
  strategy,
  opened,
  onClose,
}: DeleteStrategyDialogProps) => {
  const { projectId, featureFlagId } = useParams();
  const { mutateAsync, isPending } = useDeleteStrategyApi(
    projectId || '',
    featureFlagId || '',
  );

  const handleDeleteStrategy = async () => {
    if (!strategy?.id) return;
    try {
      await mutateAsync(strategy.id);
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
      title={`Delete: ${strategy?.name || `Strategy #${strategy?.id?.slice(0, 8)}`}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this strategy:{' '}
          {strategy?.name || `Strategy #${strategy?.id?.slice(0, 8)}`}?
        </Text>
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
            onClick={handleDeleteStrategy}
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
