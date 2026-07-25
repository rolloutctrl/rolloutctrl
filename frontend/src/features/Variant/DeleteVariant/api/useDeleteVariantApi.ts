import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import {
  getFeatureFlagByIdQueryKey,
  getProjectByIdQueryKey,
  getProjectsQueryKey,
  getVariantsByFlagIdQueryKey,
} from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteVariant = async (variantId?: string) => {
  const response = await apiClient.delete(
    apiRoutes.variants.delete(variantId),
  );
  return response.data;
};

export const useDeleteVariantApi = (projectId?: string, flagId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (variantId: string) => deleteVariant(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: [getProjectByIdQueryKey, { projectId }],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: [getProjectsQueryKey],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: [getVariantsByFlagIdQueryKey],
        type: 'all',
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Variant deleted',
        message: 'Variant has been deleted successfully',
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
