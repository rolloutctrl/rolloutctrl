import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getOrganizationMembersQueryKey } from '@/shared/constants/consts';
import type { Nullable } from '@/shared/types/types';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteOrganizationMember = async (
  organizationId?: Nullable<string>,
  userId?: Nullable<string>,
) => {
  const response = await apiClient.delete(
    apiRoutes.organizations.deleteMember(organizationId, userId),
  );
  return response.data;
};

export const useDeleteOrganizationMemberApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({
      organizationId,
      userId,
    }: {
      organizationId?: Nullable<string>;
      userId?: Nullable<string>;
    }) => deleteOrganizationMember(organizationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getOrganizationMembersQueryKey],
        type: 'all',
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Member deleted',
        message: 'Member has been deleted successfully',
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
