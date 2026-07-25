import { Button, Loader, Modal, Text } from '@mantine/core';
import { useDeleteOrganizationMemberApi } from '../api/useDeleteOrganizationMemberApi';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import type { User } from '@/entities/User';

type DeleteOrganizationMemberDialogProps = {
  member?: User | null;
  opened: boolean;
  onClose: () => void;
};

export const DeleteOrganizationMemberDialog = ({
  opened,
  member,
  onClose,
}: DeleteOrganizationMemberDialogProps) => {
  const userId = member?.id || '';
  const organizationId = member?.organizationId || '';
  const { mutateAsync, isPending } = useDeleteOrganizationMemberApi();

  const handleDeleteMember = async () => {
    try {
      await mutateAsync({ userId, organizationId });
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
      title={`Delete memebr: ${member?.name}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this member:{' '}
          <strong>{member?.name}</strong>?
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
            onClick={handleDeleteMember}
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
