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
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useGetCurrentUser } from '@/entities/User';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useDeleteUserApi } from '../api/useDeleteUserApi';

type DeleteUserDialogProps = {
  opened: boolean;
  onClose: () => void;
};

export const DeleteUserDialog = ({
  opened,
  onClose,
}: DeleteUserDialogProps) => {
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useAuthContext();
  const [value, setValue] = useState('');
  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUser(isAuthenticated);

  const { mutateAsync, isPending } = useDeleteUserApi();

  const handleDeleteProfile = async () => {
    try {
      await mutateAsync();
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

  const isLoading = isLoadingUser || isPending;

  const isButtonDisabled = isLoading || value !== currentUser?.email;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete account"
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete your account?
        </Text>
        <Alert
          variant={colorScheme === 'light' ? 'filled' : 'light'}
          color="red"
          title="Warning"
          icon={<IconAlertCircle size={16}  />}
        >
          <Text size="sm">
            This action cannot be undone. To confirm deletion, please type your email "{currentUser?.email}" below.
          </Text>
        </Alert>
        <TextInput
          name="email"
          label="Email"
          placeholder={`Enter "${currentUser?.email}" to confirm`}
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
            onClick={handleDeleteProfile}
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
