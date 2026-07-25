import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DeleteUserDialog } from './DeleteUserDialog';

export const DeleteUserButton = () => {
  const [opened, handlers] = useDisclosure(false);
  return (
    <>
      <Button variant="light" color="red" onClick={handlers.open}>
        Delete your account
      </Button>
      <DeleteUserDialog opened={opened} onClose={handlers.close} />
    </>
  );
};
