import { apiClient } from '@/shared/api/apiClient';
import type { CreateProjectFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectsQueryKey } from '@/shared/constants/consts';
import type { Project } from '@/entities/Project';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useCurrentProjectStore } from '../../SelectCurrentProject/model/useCurrentProjectStore';

const createProject = async (data: CreateProjectFormState) => {
  const response = await apiClient.post<Project>(
    apiRoutes.projects.create,
    data,
  );
  return response.data;
};

export const useCreateProjectApi = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSelectedProjectId } = useCurrentProjectStore();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateProjectFormState) => createProject(data),
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({
        queryKey: [getProjectsQueryKey],
      });

      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Project created',
        message: `The project ${data.name} has been created successfully`,
        color: 'rollout'
      });

      setSelectedProjectId(data.slug);
      navigate(`/project/${data.slug}/feature-flags`);
    },
    onError: (error) => {
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Project creation failed',
        message: error.message,
        color: 'red',
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
