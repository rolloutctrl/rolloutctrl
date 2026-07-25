import { apiClient } from '@/shared/api/apiClient';
import type {
  ToggleFlagFavoriteBody,
  ToggleFlagFavoriteParams,
} from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  type FeatureFlag,
  type FeatureFlagsResponse,
} from '@/entities/FeatureFlag';
import { getFeatureFlagsByProjectIdQueryKey } from '@/shared/constants/consts';

type FeatureFlagWithProjectId = FeatureFlag & {
  projectId: string;
};

const toggleFlagFavorite = async (
  data: ToggleFlagFavoriteParams,
): Promise<FeatureFlagWithProjectId> => {
  const { flagId, projectId, enabled } = data;
  const body: ToggleFlagFavoriteBody = {
    enabled,
  };
  const response = await apiClient.patch<FeatureFlag>(
    apiRoutes.featureFlags.toggleFavorite(flagId),
    body,
  );
  return { ...response.data, projectId };
};

export const useToggleFlagFavoriteApi = (includeArchived?: boolean) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (state: ToggleFlagFavoriteParams) => toggleFlagFavorite(state),
    onSuccess: (data: FeatureFlagWithProjectId) => {
      const { id: featureFlagId, isFavorite, projectId } = data;

      const queryKey = [
        getFeatureFlagsByProjectIdQueryKey,
        {
          projectId,
          includeArchived,
        },
      ];

      const existingData =
        queryClient.getQueryData<InfiniteData<FeatureFlagsResponse, string>>(
          queryKey,
        );

      if (!existingData) {
        return queryClient.invalidateQueries({
          queryKey: [
            getFeatureFlagsByProjectIdQueryKey,
            {
              projectId,
              includeArchived,
            },
          ],
          type: 'all',
        });
      }

      const updatedPages = existingData.pages.map((page) => ({
        ...page,
        data: page.data.map((flag) =>
          flag.id === featureFlagId
            ? {
                ...flag,
                isFavorite,
              }
            : flag,
        ),
      }));

      queryClient.setQueryData(queryKey, {
        ...existingData,
        pages: updatedPages,
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
