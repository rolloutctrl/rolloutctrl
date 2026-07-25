import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getSegmentsByProjectIdQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteSegment = async (segmentId: string) => {
  const response = await apiClient.delete(apiRoutes.segments.delete(segmentId));
  return response.data;
};

export const useDeleteSegmentApi = (projectId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (segmentId: string) => deleteSegment(segmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getSegmentsByProjectIdQueryKey, projectId],
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Segment deleted',
        message: 'Segment has been deleted successfully',
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
