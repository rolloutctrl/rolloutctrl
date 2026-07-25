import { apiClient } from '@/shared/api/apiClient';
import type { CreateSegmentFormState } from '../model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSegmentsByProjectIdQueryKey } from '@/shared/constants/consts';
import type { Segment } from '@/entities/Segment';
import { apiRoutes } from '@/shared/api/apiRoutes';

const createSegment = async (data: CreateSegmentFormState) => {
  const body = {
    ...data,
    rules: data.rules?.map((rule) => ({
      ...rule,
      value: Array.isArray(rule.value)
        ? JSON.stringify(rule.value)
        : rule.value,
    })),
  };
  const response = await apiClient.post<Segment>(
    apiRoutes.segments.create,
    body,
  );
  return response.data;
};

export const useCreateSegmentApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateSegmentFormState) => createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getSegmentsByProjectIdQueryKey, projectId],
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
