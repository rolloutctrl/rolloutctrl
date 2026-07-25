import { apiClient } from '@/shared/api/apiClient';
import type { EditOrganizationMemberFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizationMembersQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { User } from '@/entities/User';

const updateOrganizationMember = async (
  data: EditOrganizationMemberFormState,
) => {
  const { id, name, email, password, role, projects, organizationId } = data;
  const body = {
    name,
    email,
    password,
    role,
    projects,
  };
  const response = await apiClient.patch<User>(
    apiRoutes.organizations.updateMember(organizationId, id),
    body,
  );
  return response.data;
};

export const useEditOrganizationMemberApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: EditOrganizationMemberFormState) =>
      updateOrganizationMember(data),
    onSuccess: (data: User) => {
      queryClient.invalidateQueries({
        queryKey: [getOrganizationMembersQueryKey],
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Member updated',
        message: `The member ${data.email} has been updated successfully`,
        color: 'rollout'
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
