import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getActionByIdQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';

const fetchActionById = async (actionId: string, projectId: string) => {
  const response = await apiClient.get(apiRoutes.actions.get(actionId, projectId));
  return response.data;
};

export const useGetActionById = (actionId: string, projectId: string) =>
  useQuery({
    queryKey: [getActionByIdQueryKey, { actionId, projectId }],
    queryFn: () => fetchActionById(actionId, projectId),
    enabled: !!actionId && !!projectId,
  });
