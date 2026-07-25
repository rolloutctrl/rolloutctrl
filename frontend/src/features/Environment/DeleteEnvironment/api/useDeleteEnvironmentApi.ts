import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import {
  getEnvironmentsByProjectIdQueryKey,
  getFeatureFlagsByProjectIdQueryKey,
} from '@/shared/constants/consts';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteEnvironment = async (environmentId: string, projectId: string) => {
  const response = await apiClient.delete(
    apiRoutes.environments.delete(environmentId, projectId),
  );
  return response.data;
};

export const useDeleteEnvironmentApi = (
  environmentName: string,
  projectId: string,
) => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (environmentId: string) =>
      deleteEnvironment(environmentId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagsByProjectIdQueryKey,
          { projectId, includeArchived: isArchiveTab },
        ],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: [getEnvironmentsByProjectIdQueryKey, { projectId }],
        type: 'all',
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Environment deleted',
        message: `Environment ${environmentName} has been deleted successfully`,
        color: 'rollout'
      });
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
