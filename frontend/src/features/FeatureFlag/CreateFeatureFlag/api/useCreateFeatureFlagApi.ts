import { apiClient } from '@/shared/api/apiClient';
import type { CreateFeatureFlagBody } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import { getFeatureFlagsByProjectIdQueryKey } from '@/shared/constants/consts';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';
import { notifications } from '@mantine/notifications';

const createFeatureFlag = async (data: CreateFeatureFlagBody) => {
  const response = await apiClient.post<FeatureFlag | FeatureFlag[]>(
    apiRoutes.featureFlags.create,
    data,
  );
  return response.data;
};

export const useCreateFeatureFlagApi = () => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateFeatureFlagBody) => createFeatureFlag(data),
    onSuccess: (data: FeatureFlag | FeatureFlag[]) => {
      const featureFlags = Array.isArray(data) ? data : [data];
      const project = featureFlags[0]?.project;
      if (project) {
        queryClient.invalidateQueries({
          queryKey: [
            getFeatureFlagsByProjectIdQueryKey,
            { projectId: project.slug, includeArchived: isArchiveTab },
          ],
          type: 'all',
        });
      }

      if (Array.isArray(data)) {
        return notifications.show({
          position: 'bottom-center',
          withCloseButton: true,
          allowClose: true,
          autoClose: 3000,
          title: 'Feature flags created',
          message: `The feature flags have been created successfully`,
          color: 'rollout'
        });
      } else {
        notifications.show({
          position: 'bottom-center',
          withCloseButton: true,
          allowClose: true,
          autoClose: 3000,
          title: 'Feature flag created',
          message: `The feature flag ${data?.key} has been created successfully`,
          color: 'rollout'
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
