import { Button, Loader, Modal, Text } from '@mantine/core';
import { useDeleteVariantApi } from '../api/useDeleteVariantApi';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import type { Nullable } from '@/shared/types/types';
import type { Variant } from '@/entities/Variant';

type DeleteVariantDialogProps = {
  variant: Nullable<Variant>;
  opened: boolean;
  onClose: () => void;
};

export const DeleteVariantDialog = ({
  variant,
  opened,
  onClose,
}: DeleteVariantDialogProps) => {
  const { projectId, featureFlagId } = useParams();
  const { mutateAsync, isPending } = useDeleteVariantApi(
    projectId || '',
    featureFlagId || '',
  );

  const handleDeleteVariant = async () => {
    if (!variant?.id) return;
    try {
      await mutateAsync(variant.id);
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
      title={`Delete variant: ${variant?.name}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this variant:{' '}
          {variant?.name}?
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
            onClick={handleDeleteVariant}
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
