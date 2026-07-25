import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getProjectApiKeysQueryKey } from '@/shared/constants/consts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const revokeApiKey = async (projectId?: string, keyId?: string) => {
  const response = await apiClient.patch(
    apiRoutes.projects.revokeApiKey(projectId, keyId),
  );
  return response.data;
};

export const useRevokeApiKeyApi = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (keyId: string) => revokeApiKey(projectId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getProjectApiKeysQueryKey, { projectId }],
        type: 'all',
      });
    },
  });

  return { mutateAsync, isPending };
};
