import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectsQueryKey } from '@/shared/constants/consts';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const deleteProject = async (projectId?: string) => {
  const response = await apiClient.delete(apiRoutes.projects.delete(projectId));
  return response.data;
};

export const useDeleteProjectApi = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId?: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getProjectsQueryKey] });
      navigate(navigationRoutes.home, { replace: true });
    },
  });
};
