import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import type { ProjectMember } from '../model/types';
import { useQuery } from '@tanstack/react-query';
import { getProjectMembersQueryKey } from '@/shared/constants/consts';

const fetchProjectMembers = async (projectId: string) => {
  const response = await apiClient.get<ProjectMember[]>(
    apiRoutes.projects.members(projectId),
  );
  return response.data;
};

export const useGetProjectMembers = (projectId?: string) =>
  useQuery({
    queryKey: [getProjectMembersQueryKey, { projectId }],
    queryFn: () => {
      if (!projectId) throw new Error('projectId is required');
      return fetchProjectMembers(projectId);
    },
    enabled: !!projectId,
  });
