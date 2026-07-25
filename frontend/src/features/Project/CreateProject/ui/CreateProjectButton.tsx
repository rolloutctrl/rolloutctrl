import {
  ActionIcon as MantineActionButton,
  Button,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateProjectForm } from './CreateProjectForm';

type CreateProjectButtonProps = {
  isIconButton?: boolean;
  label?: string;
};

export const CreateProjectButton = ({
  isIconButton = false,
  label = 'Create Project',
}: CreateProjectButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      {isIconButton ? (
        <MantineActionButton type="button" variant="light" onClick={open} size={36} aria-label="Create Project">
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
        title="Create Project"
        classNames={{
          // header: '!bg-transparent',
          title: 'space-grotesk-semibold !font-bold',
        }}
      >
        <CreateProjectForm onClose={close} />
      </Modal>
    </>
  );
};
