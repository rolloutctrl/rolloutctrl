import { apiClient } from '@/shared/api/apiClient';
import type { AddOrganizationMemberFormState } from '../model/types';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizationMembersQueryKey } from '@/shared/constants/consts';
import { notifications } from '@mantine/notifications';
import type { User } from '@/entities/User';

const addOrganizationMember = async (data: AddOrganizationMemberFormState) => {
  const { organizationId, email, name, password, role, projects } = data;
  const body = {
    email,
    role,
    name,
    password,
    projects: projects.map(({ projectId, teamRole }) => ({
      projectId,
      teamRole,
    })),
  };
  const response = await apiClient.post<User>(apiRoutes.organizations.addMember(organizationId), body);
  return response.data;
};

export const useAddOrganizationMemberApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: AddOrganizationMemberFormState) =>
      addOrganizationMember(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [getOrganizationMembersQueryKey],
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Member created',
        message: `The member ${data.email} has been created successfully`,
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
