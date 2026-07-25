import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectsQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { ProjectWithStats } from '../model/types';

const fetchProjects = async () => {
  const response = await apiClient.get<ProjectWithStats[]>(
    apiRoutes.projects.list,
  );
  return response.data;
};

export const useGetProjects = () =>
  useQuery({
    queryKey: [getProjectsQueryKey],
    queryFn: fetchProjects,
  });
