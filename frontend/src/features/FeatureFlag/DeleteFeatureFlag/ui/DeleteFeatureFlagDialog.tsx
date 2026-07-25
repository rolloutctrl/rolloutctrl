import { Alert, Button, Loader, Modal, Text, useMantineColorScheme } from '@mantine/core';
import { useDeleteFeatureFlagApi } from '../api/useDeleteFeatureFlagApi';
import { notifications } from '@mantine/notifications';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import { IconAlertCircle } from '@tabler/icons-react';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

type DeleteFeatureFlagDialogProps = {
  featureFlag?: FeatureFlag | null;
  opened: boolean;
  onClose: () => void;
  needRedirect?: boolean;
};

export const DeleteFeatureFlagDialog = ({
  featureFlag,
  opened,
  onClose,
  needRedirect,
}: DeleteFeatureFlagDialogProps) => {
  const projectId = featureFlag?.project?.slug ?? '';
  const flagKey = featureFlag?.key ?? '';
  const { colorScheme } = useMantineColorScheme();
  const { mutateAsync, isPending } = useDeleteFeatureFlagApi(
    flagKey,
    projectId,
    needRedirect,
  );

  const hasEabledEnvs = featureFlag?.environments?.some(
    (env) => env.enabled === true,
  );

  const handleDeleteFeatureFlag = async () => {
    if (!featureFlag?.id) return;
    try {
      await mutateAsync(featureFlag.id);
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
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete flag: ${featureFlag?.key}`}
      size="lg"
    >
      <div className="flex flex-col w-full gap-4">
        <Text size="md">
          Are you sure you want to delete this feature flag:{' '}
          <strong>{featureFlag?.key}</strong>?
        </Text>
        {hasEabledEnvs && (
          <Alert
            variant={colorScheme === 'light' ? 'filled' : 'light'}
            color="red"
            title="Warning: Flag is active"
            icon={<IconAlertCircle size={16}  />}
          >
            <Text size="sm">
              This feature flag is currently <strong>enabled</strong> in the
              following environment(s):
            </Text>
            <ul className="list-disc pl-5 mb-3">
              {featureFlag?.environments
                ?.filter((env) => env.enabled === true)
                .map((env) => (
                  <li key={env.environment.id}>
                    <Text size="sm" component="span" fw={500}>
                      {env.environment.name}
                    </Text>
                  </li>
                ))}
            </ul>
            <Text size="sm" color="red" fw={700} className="mt-2">
              Deleting this flag may cause runtime errors in active
              environments!
            </Text>
          </Alert>
        )}
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="light"
            color="gray"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="light"
            onClick={handleDeleteFeatureFlag}
            color="red"
            disabled={isPending}
          >
            {isPending ? <Loader size="xs" color="white" /> : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
