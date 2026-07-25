import { apiClient } from '@/shared/api/apiClient';
import type { ToggleFlagEnableParams } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import { notifications } from '@mantine/notifications';
import {
  getFeatureFlagByIdQueryKey,
  getFeatureFlagsByProjectIdQueryKey,
  getNotificationsQueryKey,
  getProjectOverviewByIdQueryKey,
} from '@/shared/constants/consts';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';

type FeatureFlagEnvironmentWithProjectId = FeatureFlagEnvironment & {
  projectId: string;
};

const toggleFlag = async (
  data: ToggleFlagEnableParams,
): Promise<FeatureFlagEnvironmentWithProjectId> => {
  const response = await apiClient.post<FeatureFlagEnvironment>(
    apiRoutes.featureFlags.toggleEnable,
    data,
  );
  return { ...response.data, projectId: data.projectId };
};

export const useToggleFlagEnableApi = () => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (state: ToggleFlagEnableParams) => toggleFlag(state),
    onSuccess: (data: FeatureFlagEnvironmentWithProjectId) => {
      const { environmentId, enabled, projectId, featureFlag, environment } =
        data;

      const projectSlug = featureFlag?.project?.slug || projectId;

      const queryKey = [
        getFeatureFlagByIdQueryKey,
        {
          projectId: projectSlug,
          featureFlagKey: featureFlag.key,
        },
      ];

      const existingData = queryClient.getQueryData<FeatureFlag>(queryKey);

      if (!existingData) {
        return queryClient.invalidateQueries({
          queryKey: [getFeatureFlagByIdQueryKey],
          type: 'all',
        });
      }

      queryClient.invalidateQueries({
        queryKey: [getNotificationsQueryKey],
        type: 'all',
      });

      queryClient.invalidateQueries({
        queryKey: [getProjectOverviewByIdQueryKey, { projectId: projectSlug }],
        type: 'all',
      });

      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagsByProjectIdQueryKey,
          { projectId: projectSlug, includeArchived: isArchiveTab },
        ],
        type: 'all',
      });

      queryClient.setQueryData(queryKey, {
        ...existingData,
        environments: existingData.environments.map((env) =>
          env.environmentId === environmentId ? { ...env, enabled } : env,
        ),
      });

      if (enabled) {
        notifications.show({
          position: 'bottom-center',
          withCloseButton: true,
          allowClose: true,
          autoClose: 3000,
          title: 'Feature flag enabled',
          message: `The feature flag ${featureFlag?.key} in ${environment?.name} has been enabled successfully`,
          color: 'rollout'
        });
      } else {
        notifications.show({
          position: 'bottom-center',
          withCloseButton: true,
          allowClose: true,
          autoClose: 3000,
          title: 'Feature flag disabled',
          message: `The feature flag ${featureFlag?.key} in ${environment?.name} has been disabled successfully`,
          color: 'red',
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
