import { useAuthContext } from '@/app/providers/AuthProvider';
import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { tokenManager } from '@/shared/api/tokenManager';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const logout = async () => {
  const response = await apiClient.post(apiRoutes.auth.logout);
  return response.data;
};

export const useLogoutApi = () => {
  const queryClient = useQueryClient();
  const { setToken, setIsAuthenticated } = useAuthContext();
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      Promise.all([
        tokenManager.clearTokens(),
        setToken(null),
        setIsAuthenticated(false),
        queryClient.clear(),
      ]);
    },
  });

  return {
    logout: mutateAsync,
    isPending,
    isError,
  };
};
