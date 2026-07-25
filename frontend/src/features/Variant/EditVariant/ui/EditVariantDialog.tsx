import { Modal } from '@mantine/core';
import type { Nullable } from '@/shared/types/types';
import type { Variant } from '@/entities/Variant';
import { EditVariantForm } from './EditVariantForm';

type EditVariantDialogProps = {
  variant: Nullable<Variant>;
  opened: boolean;
  onClose: () => void;
};

export const EditVariantDialog = ({
  variant,
  opened,
  onClose,
}: EditVariantDialogProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit variant: ${variant?.name}`}
      closeOnClickOutside={false}
      size="lg"
    >
      {variant && <EditVariantForm variant={variant} onClose={onClose} />}
    </Modal>
  );
};
