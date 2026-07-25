import {
  ActionIcon as MantineActionButton,
  Button,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { AddOrganizationMemberForm } from './AddOrganizationMemberForm';

type AddOrganizationMemberButtonProps = {
  isIconButton?: boolean;
  label?: string;
};

export const AddOrganizationMemberButton = ({
  isIconButton = false,
  label = 'Add Member',
}: AddOrganizationMemberButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      {isIconButton ? (
        <MantineActionButton
          type="button"
          variant="light"
          onClick={open}
          size={36}
        >
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
      <Modal opened={opened} onClose={close} size="lg" title="Add Member">
        <AddOrganizationMemberForm onClose={close} />
      </Modal>
    </>
  );
};
