import { apiClient } from '@/shared/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFeatureFlagByIdQueryKey,
  getVariantsByFlagIdQueryKey,
} from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { EditVariantFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';

const editVariant = async (variantId: string, data: EditVariantFormState) => {
  const response = await apiClient.patch(apiRoutes.variants.update(variantId), data);
  return response.data;
};

export const useEditVariantApi = (projectId?: string, flagId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: EditVariantFormState }) =>
      editVariant(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: flagId },
        ],
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
        title: 'Variant updated',
        message: 'Variant has been updated successfully',
        color: 'rollout'
      });
    },
  });

  return { mutateAsync, isPending, isError, isSuccess };
};
