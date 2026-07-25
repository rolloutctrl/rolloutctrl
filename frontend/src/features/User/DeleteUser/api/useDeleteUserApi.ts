import { useAuthContext } from '@/app/providers/AuthProvider';
import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { tokenManager } from '@/shared/api/tokenManager';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const deleteUser = async () => {
  const response = await apiClient.delete(apiRoutes.users.delete);
  return response.data;
};

export const useDeleteUserApi = () => {
  const { setToken } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUser(),
    onSuccess: () => {
      tokenManager.clearTokens();
      setToken(null);
      queryClient.clear();
      navigate(navigationRoutes.login, { replace: true });
    },
  });
};
