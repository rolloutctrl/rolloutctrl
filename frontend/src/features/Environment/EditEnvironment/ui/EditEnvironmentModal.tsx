import type { Nullable } from '@/shared/types/types';
import { Modal } from '@mantine/core';
import { EditEnvironmentForm } from './EditEnvironmentForm';
import type { EnvironmentWithCounts } from '@/entities/Environment/model/types';

type EditEnvironmentModalProps = {
  environment: Nullable<EnvironmentWithCounts>;
  opened: boolean;
  onClose: () => void;
};

export const EditEnvironmentModal = ({
  environment,
  opened,
  onClose,
}: EditEnvironmentModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Environment: ${environment?.name}`}
      size="md"
    >
      <EditEnvironmentForm
        environmentId={environment?.id || ''}
        onClose={onClose}
      />
    </Modal>
  );
};
