import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getOrganizationMembersQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/entities/User';

const fetchOrganizationMembers = async () => {
  const response = await apiClient.get<User[]>(
    apiRoutes.organizations.getMembers,
  );
  return response.data;
};

export const useGetOrganizationMembers = () =>
  useQuery({
    queryKey: [getOrganizationMembersQueryKey],
    queryFn: () => fetchOrganizationMembers(),
  });
