import { apiClient } from '@/shared/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFeatureFlagByIdQueryKey,
  getVariantsByFlagIdQueryKey,
} from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { CreateVariantFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';

const createVariant = async (data: CreateVariantFormState) => {
  const response = await apiClient.post(
    apiRoutes.variants.create(data.featureFlagId),
    data,
  );
  return response.data;
};

export const useCreateVariantApi = (projectId?: string, flagId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateVariantFormState) => createVariant(data),
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
        title: 'Variant created',
        message: 'Variant has been created successfully',
        color: 'rollout',
      });
    },
  });

  return { mutateAsync, isPending, isError, isSuccess };
};
