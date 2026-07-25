import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActionsByProjectIdQueryKey,
  getActionByIdQueryKey,
} from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { UpdateActionBody } from '../model/types';
import { type Action } from '@/entities/Action';

const updateAction = async ({
  actionId,
  body,
}: {
  actionId: string;
  body: UpdateActionBody;
}) => {
  const response = await apiClient.patch<Action>(apiRoutes.actions.update(actionId), body);
  return response.data;
};

export const useUpdateActionApi = (actionId: string, projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateActionBody) => updateAction({ actionId, body }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [getActionByIdQueryKey, { actionId: data.key, projectId }],
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [getActionsByProjectIdQueryKey, { projectId }],
        });
      }
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Action updated',
        message: 'Action has been updated successfully',
        color: 'rollout'
      });
    },
  });
};
