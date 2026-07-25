import {
  ActionIcon as MantineActionButton,
  Button,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { GenerateApiKeyForm } from './GenerateApiKeyForm';

type GenerateApiKeyButtonProps = {
  isIconButton?: boolean;
  label?: string;
};

export const GenerateApiKeyButton = ({
  isIconButton = false,
  label = 'Generate API Key',
}: GenerateApiKeyButtonProps) => {
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
        title="Generate New API Key"
        closeOnClickOutside={false}
      >
        <GenerateApiKeyForm onClose={close} />
      </Modal>
    </>
  );
};
