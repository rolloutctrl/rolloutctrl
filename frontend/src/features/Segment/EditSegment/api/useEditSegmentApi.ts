import { apiClient } from '@/shared/api/apiClient';
import type { EditSegmentFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSegmentByIdQueryKey,
  getSegmentsByProjectIdQueryKey,
} from '@/shared/constants/consts';
import type { Segment } from '@/entities/Segment';

const updateSegment = async (data: EditSegmentFormState) => {
  const { id, ...restData } = data;
  const body = {
    ...restData,
    rules: (restData.rules || [])?.map((rule) => ({
      ...rule,
      value: Array.isArray(rule.value)
        ? JSON.stringify(rule.value)
        : rule.value,
    })),
  };
  const response = await apiClient.patch<Segment>(
    apiRoutes.segments.update(id),
    body,
  );
  return response.data;
};

export const useEditSegmentApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditSegmentFormState) => updateSegment(data),
    onSuccess: (data: Segment) => {
      queryClient.invalidateQueries({
        queryKey: [getSegmentsByProjectIdQueryKey, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [getSegmentByIdQueryKey, data.id],
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
