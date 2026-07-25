import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getOrganizationQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { Organization } from '../model/types';

const fetchOrganization = async () => {
  const response = await apiClient.get<Organization>(
    apiRoutes.organizations.get,
  );
  return response.data;
};

export const useGetOrganization = () =>
  useQuery({
    queryKey: [getOrganizationQueryKey],
    queryFn: fetchOrganization,
  });
