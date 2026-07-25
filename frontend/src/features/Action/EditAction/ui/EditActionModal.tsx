import { Modal } from '@mantine/core';
import { useGetActionById, type Action } from '@/entities/Action';
import { EditActionForm } from './EditActionForm';
import { useParams } from 'react-router-dom';

type EditActionModalProps = {
  selectedAction?: Action;
  opened: boolean;
  onClose: () => void;
};

export const EditActionModal = ({
  selectedAction,
  opened,
  onClose,
}: EditActionModalProps) => {
  const { projectId } = useParams();
  const { data: action, isLoading } = useGetActionById(
    selectedAction?.id || '',
    projectId || '',
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`Edit Action: ${selectedAction?.key}`}
    >
      {!isLoading && action && (
        <EditActionForm action={action} onClose={onClose} />
      )}
    </Modal>
  );
};
