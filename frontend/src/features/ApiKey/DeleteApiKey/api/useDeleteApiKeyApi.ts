import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectApiKeysQueryKey } from '@/shared/constants/consts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteApiKey = async (projectId: string, keyId: string) => {
  const response = await apiClient.delete(
    apiRoutes.projects.deleteApiKey(projectId, keyId),
  );
  return response.data;
};

export const useDeleteApiKeyApi = (projectId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (keyId: string) => deleteApiKey(projectId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getProjectApiKeysQueryKey, { projectId }],
        type: 'all',
      });
    },
  });

  return { mutateAsync, isPending };
};
