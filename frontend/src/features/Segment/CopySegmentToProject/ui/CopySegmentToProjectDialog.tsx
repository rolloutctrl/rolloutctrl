import type { Segment } from '@/entities/Segment';
import { Modal } from '@mantine/core';
import type { Nullable } from '@/shared/types/types';
import { CopySegmentToProjectForm } from './CopySegmentToProjectForm';

type CopySegmentToProjectDialogProps = {
  segment: Nullable<Segment>;
  opened: boolean;
  onClose: () => void;
};

export const CopySegmentToProjectDialog = ({
  segment,
  opened,
  onClose,
}: CopySegmentToProjectDialogProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Copy Segment: ${segment?.name}`}
      size="md"
    >
      <CopySegmentToProjectForm
        segmentId={segment?.id ?? ''}
        segmentName={segment?.name ?? ''}
        onClose={onClose}
      />
    </Modal>
  );
};
