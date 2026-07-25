import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateActionForm } from './CreateActionForm';

type CreateActionButtonProps = {
  label?: string;
};

export const CreateActionButton = ({
  label = 'Add Action',
}: CreateActionButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Button
        type="button"
        variant="light"
        leftSection={<IconPlus size={16}  />}
        onClick={open}
      >
        {label}
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        title="Create Action"
      >
        <CreateActionForm onClose={close} />
      </Modal>
    </>
  );
};
