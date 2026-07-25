import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { tokenManager } from '@/shared/api/tokenManager';
import { apiRoutes } from '@/shared/api/apiRoutes';

type LoginBody = {
  email: string;
  password: string;
};

const login = async (data: LoginBody) => {
  const response = await apiClient.post(apiRoutes.auth.login, data);
  return response.data;
};

export const useLoginFormApi = () => {
  const { setToken } = useAuthContext();
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (data: LoginBody) => login(data),
    onSuccess: (data) => {
      tokenManager.setToken(data.accessToken);
      setToken(data.accessToken);
    },
  });

  return { mutateAsync, isPending, isError };
};
