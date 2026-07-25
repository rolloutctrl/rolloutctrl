import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateVariantForm } from './CreateVariantForm';

type CreateVariantButtonProps = {
  label?: string;
  disabled?: boolean;
};

export const CreateVariantButton = ({
  disabled,
  label = 'Add Variants',
}: CreateVariantButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        leftSection={<IconPlus size={16} />}
        variant="light"
        onClick={open}
        disabled={disabled}
      >
        {label}
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Add Variants"
        closeOnClickOutside={false}
        size="lg"
      >
        <CreateVariantForm onClose={close} />
      </Modal>
    </>
  );
};
