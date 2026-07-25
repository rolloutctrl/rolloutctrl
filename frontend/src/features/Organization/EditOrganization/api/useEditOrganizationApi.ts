import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import type { EditOrganizationFormState } from '../model/types';
import type { Organization } from '@/entities/Organization';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrganizationsQueryKey,
  getOrganizationQueryKey,
} from '@/shared/constants/consts';

const updateOrganization = async (data: EditOrganizationFormState) => {
  const { organizationId, ...rest } = data;
  const response = await apiClient.patch<Organization>(
    apiRoutes.organizations.update(organizationId),
    rest,
  );
  return { organizationId, organization: response.data };
};

export const useEditOrganizationApi = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isError, isPending, isSuccess } = useMutation({
    mutationFn: (data: EditOrganizationFormState) => updateOrganization(data),
    onSuccess: (data) => {
      const { organizationId } = data;
      queryClient.invalidateQueries({
        queryKey: [getOrganizationQueryKey, { organizationId }],
        type: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: [getMyOrganizationsQueryKey],
        type: 'active',
      });
    },
  });

  return {
    mutateAsync,
    isError,
    isPending,
    isSuccess,
  };
};
