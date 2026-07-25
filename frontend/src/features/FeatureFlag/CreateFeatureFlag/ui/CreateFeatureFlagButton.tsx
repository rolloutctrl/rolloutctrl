import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreateFeatureFlagForm } from './CreateFeatureFlagForm';

type CreateFeatureFlagButtonProps = {
  label?: string;
};

export const CreateFeatureFlagButton = ({
  label = 'Add Flag',
}: CreateFeatureFlagButtonProps) => {
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
        size="md"
        title="Create Feature Flag"
      >
        <CreateFeatureFlagForm onClose={close} />
      </Modal>
    </>
  );
};
