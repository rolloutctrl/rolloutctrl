import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DeleteProjectDialog } from './DeleteProjectDialog';

export const DeleteProjectButton = () => {
  const [opened, handlers] = useDisclosure(false);
  return (
    <>
      <Button variant="light" color="red" onClick={handlers.open}>
        Delete Project
      </Button>
      <DeleteProjectDialog opened={opened} onClose={handlers.close} />
    </>
  );
};
