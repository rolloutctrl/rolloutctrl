import { apiClient } from '@/shared/api/apiClient';
import type { EditEnvironmentFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnvironmentByIdQueryKey,
  getEnvironmentsByProjectIdQueryKey,
  getFeatureFlagsByProjectIdQueryKey,
} from '@/shared/constants/consts';
import type { Environment } from '@/entities/Environment';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';

const updateEnvironment = async (data: EditEnvironmentFormState) => {
  const { environmentId, ...restData } = data;
  const response = await apiClient.patch<Environment>(
    apiRoutes.environments.update(environmentId),
    restData,
  );
  return response.data;
};

export const useEditEnvironmentApi = () => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditEnvironmentFormState) => updateEnvironment(data),
    onSuccess: (data: Environment) => {
      const project = data.project;
      if (project) {
        queryClient.invalidateQueries({
          queryKey: [
            getEnvironmentByIdQueryKey,
            { projectId: project.slug, environmentId: data.id },
          ],
          type: 'active',
        });
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
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
