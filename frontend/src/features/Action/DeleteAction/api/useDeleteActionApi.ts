import type { Action } from '@/entities/Action';
import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getActionsByProjectIdQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const deleteAction = async (actionId: string) => {
  const response = await apiClient.delete<Action>(
    apiRoutes.actions.delete(actionId),
  );
  return response.data;
};

export const useDeleteActionApi = (
  actionKey: string,
  projectId: string,
  needRedirect?: boolean,
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (actionId: string) => deleteAction(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getActionsByProjectIdQueryKey, { projectId }],
        type: 'all',
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Action deleted',
        message: `Action ${actionKey} has been deleted successfully`,
        color: 'rollout'
      });
      if (needRedirect) {
        navigate(`/project/${projectId}/actions`);
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
