import { apiClient } from "@/shared/api/apiClient";
import { apiRoutes } from "@/shared/api/apiRoutes";
import { getCurrentUserQueryKey } from "@/shared/constants/consts";
import { useQuery } from "@tanstack/react-query";
// import type { OrganizationMember } from "@/entities/Organization";
import type { User } from "../model/types";

const fetchCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(apiRoutes.auth.me);
  return response.data;
};

export const useGetCurrentUser = (isAuthenticated?: boolean) => useQuery({
  queryKey: [getCurrentUserQueryKey],
  queryFn: fetchCurrentUser,
  enabled: !!isAuthenticated,
});