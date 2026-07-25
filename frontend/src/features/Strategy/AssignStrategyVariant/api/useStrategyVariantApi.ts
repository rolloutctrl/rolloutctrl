import { apiClient } from '@/shared/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import type { StrategyVariant } from '@/entities/Variant';
import type { AssignVariantItem } from '../model/types';
import {
  getFeatureFlagByIdQueryKey,
  getStrategyByIdQueryKey,
  getStrategyVariantsQueryKey,
} from '@/shared/constants/consts';
import { useParams } from 'react-router-dom';

type CreateStrategyVariantPayload = {
  variantId?: string;
  name?: string;
  colorTag?: string;
  description?: string;
  payloadType?: string;
  payload?: string;
  weight?: number;
  isCustomWeight?: boolean;
};

export const useAddVariantToStrategy = (strategyId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStrategyVariantPayload) => {
      if (!strategyId) throw new Error('strategyId is required');
      const response = await apiClient.post<StrategyVariant>(
        `/strategies/${strategyId}/variants`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getStrategyVariantsQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey, { strategyId }],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Failed to add variant';
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
};

export const useBatchAddVariantsToStrategy = (strategyId?: string) => {
  const { projectId, featureFlagId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payloads: CreateStrategyVariantPayload[]) => {
      if (!strategyId) throw new Error('strategyId is required');
      const response = await apiClient.post<StrategyVariant[]>(
        `/strategies/${strategyId}/variants/batch`,
        { variants: payloads },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getStrategyVariantsQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: featureFlagId },
        ],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Failed to add variants';
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
};

type UpdateStrategyVariantPayload = {
  weight?: number;
  isCustomWeight?: boolean;
};

export const useUpdateStrategyVariant = (strategyId?: string) => {
  const { projectId, featureFlagId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: UpdateStrategyVariantPayload;
    }) => {
      if (!strategyId) throw new Error('strategyId is required');
      const response = await apiClient.patch<StrategyVariant>(
        `/strategies/${strategyId}/variants/${variantId}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getStrategyVariantsQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: featureFlagId },
        ],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update variant';
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
};

export const useRemoveVariantFromStrategy = (strategyId?: string) => {
  const { projectId, featureFlagId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantId: string) => {
      if (!strategyId) throw new Error('strategyId is required');
      await apiClient.delete(`/strategies/${strategyId}/variants/${variantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getStrategyVariantsQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [getStrategyByIdQueryKey, { strategyId }],
      });
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagByIdQueryKey,
          { projectId, featureFlagKey: featureFlagId },
        ],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Failed to remove variant';
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 3000,
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
};

export const buildCreatePayload = (
  item: AssignVariantItem,
): CreateStrategyVariantPayload => {
  if (item.variantId) {
    return {
      variantId: item.variantId,
      weight: item.weight,
      isCustomWeight: item.isCustomWeight,
    };
  }
  return {
    name: item.name,
    colorTag: item.colorTag,
    description: item.description,
    payloadType: item.payloadType,
    payload: item.payload,
    weight: item.weight,
    isCustomWeight: item.isCustomWeight,
  };
};
