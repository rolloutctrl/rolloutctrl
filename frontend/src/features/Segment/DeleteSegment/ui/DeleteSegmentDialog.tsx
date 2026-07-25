import type { Segment } from '@/entities/Segment';
import { Button, Loader, Modal, Text } from '@mantine/core';
import { useDeleteSegmentApi } from '../api/useDeleteSegmentApi';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import type { Nullable } from '@/shared/types/types';

type DeleteSegmentDialogProps = {
  segment: Nullable<Segment>;
  opened: boolean;
  onClose: () => void;
};

export const DeleteSegmentDialog = ({
  segment,
  opened,
  onClose,
}: DeleteSegmentDialogProps) => {
  const projectId = segment?.projectId ?? '';
  const { mutateAsync, isPending } = useDeleteSegmentApi(projectId);

  const handleDeleteSegment = async () => {
    if (!segment?.id) return;
    try {
      await mutateAsync(segment.id);
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
      title={`Delete Segment: ${segment?.name}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this segment: {segment?.name}?
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
            onClick={handleDeleteSegment}
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
