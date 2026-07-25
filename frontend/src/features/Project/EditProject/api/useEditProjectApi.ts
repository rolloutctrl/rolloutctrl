import { apiClient } from '@/shared/api/apiClient';
import type { EditProjectFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectByIdQueryKey, getProjectsQueryKey } from '@/shared/constants/consts';
import type { Project } from '@/entities/Project';
import { notifications } from '@mantine/notifications';
import { useCurrentProjectStore } from '../../SelectCurrentProject/model/useCurrentProjectStore';
import { useNavigate } from 'react-router-dom';

const updateProject = async (data: EditProjectFormState) => {
  const response = await apiClient.patch<Project>(
    apiRoutes.projects.update,
    data,
  );
  return response.data;
};

export const useEditProjectApi = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedProjectId } = useCurrentProjectStore();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditProjectFormState) => updateProject(data),
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({
        queryKey: [getProjectsQueryKey],
      });

      queryClient.invalidateQueries({
        queryKey: [getProjectByIdQueryKey, data.slug],
      });

      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Project updated',
        message: `The project ${data.name} has been updated successfully`,
        color: 'rollout'
      });

      setSelectedProjectId(data.slug);
      navigate(`/project/${data.slug}/settings`, { replace: true });
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
