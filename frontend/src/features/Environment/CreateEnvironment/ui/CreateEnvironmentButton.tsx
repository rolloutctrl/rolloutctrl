import {
  ActionIcon as MantineActionButton,
  Button,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateEnvironmentForm } from './CreateEnvironmentForm';

type CreateEnvironmentButtonProps = {
  isIconButton?: boolean;
  label?: string;
};

export const CreateEnvironmentButton = ({
  isIconButton = false,
  label = 'Create Environment',
}: CreateEnvironmentButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      {isIconButton ? (
        <MantineActionButton type="button" variant="light" onClick={open} size={36}>
          <IconPlus size={16}  />
        </MantineActionButton>
      ) : (
        <Button
          type="button"
          variant="light"
          leftSection={<IconPlus size={16}  />}
          onClick={open}
        >
          {label}
        </Button>
      )}
      <Modal
        opened={opened}
        onClose={close}
        size="md"
        title="Add Environment"
      >
        <CreateEnvironmentForm onClose={close} />
      </Modal>
    </>
  );
};
