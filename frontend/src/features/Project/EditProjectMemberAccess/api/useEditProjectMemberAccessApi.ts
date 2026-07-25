import { apiClient } from '@/shared/api/apiClient';
import type { EditProjectMemberAccessFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectMembersQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { ProjectMember } from '@/entities/Project';

const updateProjectMemberAccess = async (
  data: EditProjectMemberAccessFormState,
  projectId: string,
) => {
  const response = await apiClient.patch<ProjectMember>(
    apiRoutes.projects.updatedProjectMemberAccess(projectId),
    data,
  );

  return response.data;
};

export const useEditProjectMemberAccessApi = (projectId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (data: EditProjectMemberAccessFormState) =>
      updateProjectMemberAccess(data, projectId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [getProjectMembersQueryKey, { projectId }],
        type: 'all',
      });

      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Updated',
        message: `The user ${data.user.name} has been assigned the new ${data.role} role`,
        color: 'rollout'
      });
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
  };
};
