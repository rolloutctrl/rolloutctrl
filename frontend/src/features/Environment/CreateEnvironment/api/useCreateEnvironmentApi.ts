import { apiClient } from '@/shared/api/apiClient';
import type { CreateEnvironmentFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnvironmentsByProjectIdQueryKey,
  getFeatureFlagsByProjectIdQueryKey,
} from '@/shared/constants/consts';
import type { Environment } from '@/entities/Environment';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';
import { notifications } from '@mantine/notifications';

const createEnvironment = async (data: CreateEnvironmentFormState) => {
  const response = await apiClient.post<Environment>(
    apiRoutes.environments.create,
    data,
  );
  return response.data;
};

export const useCreateEnvironmentApi = () => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateEnvironmentFormState) => createEnvironment(data),
    onSuccess: (data: Environment) => {
      const project = data.project;
      if (project) {
        queryClient.invalidateQueries({
          queryKey: [
            getEnvironmentsByProjectIdQueryKey,
            { projectId: project.slug },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            getFeatureFlagsByProjectIdQueryKey,
            { projectId: project.slug, includeArchived: isArchiveTab },
          ],
          type: 'all',
        });
      }
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Environment created',
        message: `The environment ${data.name} has been created successfully`,
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
