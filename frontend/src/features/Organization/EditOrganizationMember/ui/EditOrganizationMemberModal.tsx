import type { Nullable } from '@/shared/types/types';
import { Modal } from '@mantine/core';
import { EditOrganizationMemberForm } from './EditOrganizationMemberForm';
import type { User } from '@/entities/User';

type EditOrganizationMemberModalProps = {
  member: Nullable<User>;
  opened: boolean;
  onClose: () => void;
};

export const EditOrganizationMemberModal = ({
  member,
  opened,
  onClose,
}: EditOrganizationMemberModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`User: ${member?.name}`}
      size="lg"
    >
      <EditOrganizationMemberForm member={member} onClose={onClose} />
    </Modal>
  );
};
