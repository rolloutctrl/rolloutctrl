import type { Segment } from '@/entities/Segment';
import type { Nullable } from '@/shared/types/types';
import { Modal } from '@mantine/core';
import { EditSegmentForm } from './EditSegmentForm';

type EditSegmentModalProps = {
  segment: Nullable<Segment>;
  opened: boolean;
  onClose: () => void;
};

export const EditSegmentModal = ({
  segment,
  opened,
  onClose,
}: EditSegmentModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Segment: ${segment?.name}`}
      size="lg"
    >
      <EditSegmentForm segmentId={segment?.id || ''} onClose={onClose} />
    </Modal>
  );
};
