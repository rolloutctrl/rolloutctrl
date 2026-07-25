import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateSegmentForm } from './CreateSegmentForm';

type CreateSegmentButtonProps = {
  label?: string;
};

export const CreateSegmentButton = ({ label = 'Add Segment' }: CreateSegmentButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        leftSection={<IconPlus size={16} />}
        variant="light"
        onClick={open}
      >
        {label}
      </Button>

      <Modal opened={opened} onClose={close} title="Create Segment" size="lg">
        <CreateSegmentForm onClose={close} />
      </Modal>
    </>
  );
};
