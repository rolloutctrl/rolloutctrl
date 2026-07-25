import {
  Alert,
  Button,
  Loader,
  Modal,
  Text,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useDeleteProjectApi } from '../api/useDeleteProjectApi';
import { useGetProjectById } from '@/entities/Project';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

type DeleteProjectDialogProps = {
  opened: boolean;
  onClose: () => void;
};

export const DeleteProjectDialog = ({
  opened,
  onClose,
}: DeleteProjectDialogProps) => {
  const { projectId } = useParams();
  const { colorScheme } = useMantineColorScheme();

  const [value, setValue] = useState('');
  const { data: project, isLoading: isProjectLoading } =
    useGetProjectById(projectId);

  const { mutateAsync, isPending } = useDeleteProjectApi();

  const handleDeleteProject = async () => {
    if (!project?.id) return;
    try {
      await mutateAsync(project.id);
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  const isLoading = isProjectLoading || isPending;

  const isButtonDisabled = isLoading || value !== project?.name;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete project: ${project?.name}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this project:{' '}
          <strong>{project?.name}</strong>?
        </Text>
        <Alert
          variant={colorScheme === 'light' ? 'filled' : 'light'}
          color="red"
          title="Warning"
          icon={<IconAlertCircle size={16}  />}
        >
          <Text size="sm">
            This action cannot be undone. To confirm deletion, please type the
            project name "{project?.name}" below.
          </Text>
        </Alert>
        <TextInput
          name="projectName"
          label="Project name"
          placeholder={`Enter "${project?.name}" to confirm`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="light"
            onClick={handleDeleteProject}
            color="red"
            disabled={isButtonDisabled}
          >
            {isLoading ? <Loader size="xs" color="white" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
