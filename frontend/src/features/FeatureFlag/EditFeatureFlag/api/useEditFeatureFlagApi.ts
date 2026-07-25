import { apiClient } from '@/shared/api/apiClient';
import type { EditFeatureFlagFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeatureFlag } from '@/entities/FeatureFlag';
import {
  getFeatureFlagByIdQueryKey,
  getFeatureFlagsByProjectIdQueryKey,
} from '@/shared/constants/consts';
import { useFeatureFlagsTabs } from '@/widgets/FeatureFlag/FeatureFlagsView';
import { useNavigate } from 'react-router-dom';

const updateFeatureFlag = async (data: EditFeatureFlagFormState) => {
  const { flagId, ...restData } = data;
  const response = await apiClient.patch<FeatureFlag>(
    apiRoutes.featureFlags.update(flagId),
    restData,
  );
  return response.data;
};

export const useEditFeatureFlagApi = (oldFlagKey: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isArchiveTab } = useFeatureFlagsTabs();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditFeatureFlagFormState) => updateFeatureFlag(data),
    onSuccess: (data: FeatureFlag) => {
      const project = data.project;
      queryClient.invalidateQueries({
          queryKey: [
            getFeatureFlagByIdQueryKey,
            { projectId: project?.slug, featureFlagKey: data.key },
          ],
        });
      if (project) {
        queryClient.invalidateQueries({
          queryKey: [
            getFeatureFlagsByProjectIdQueryKey,
            { projectId: project?.slug, includeArchived: isArchiveTab },
          ],
          type: 'all',
        });
      }
      if (oldFlagKey !== data.key) {
        navigate(
          `/project/${project?.slug}/feature-flags/${data.key}`,
          { replace: true },
        );
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
