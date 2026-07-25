import { apiClient } from '@/shared/api/apiClient';
import type { GenerateApiKeyFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectApiKeysQueryKey } from '@/shared/constants/consts';

const generateApiKey = async (
  projectId: string,
  data: GenerateApiKeyFormState,
) => {
  const response = await apiClient.post<{ key: string }>(
    apiRoutes.projects.generateApiKey(projectId),
    data,
  );
  return response.data;
};

export const useGenerateApiKeyApi = (projectId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: GenerateApiKeyFormState) =>
      generateApiKey(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getProjectApiKeysQueryKey, { projectId }],
        type: 'all',
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
