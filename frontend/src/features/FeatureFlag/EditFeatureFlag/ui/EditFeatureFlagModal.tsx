import { Modal } from '@mantine/core';
import { EditFeatureFlagForm } from './EditFeatureFlagForm';
import type { FeatureFlag } from '@/entities/FeatureFlag';

type EditFeatureFlagModalProps = {
  featureFlag?: FeatureFlag | null;
  opened: boolean;
  onClose: () => void;
};

export const EditFeatureFlagModal = ({
  featureFlag,
  opened,
  onClose,
}: EditFeatureFlagModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Flag: ${featureFlag?.key}`}
      size="md"
    >
      <EditFeatureFlagForm flagKey={featureFlag?.key || ''} onClose={onClose} />
    </Modal>
  );
};
