import { apiClient } from "@/shared/api/apiClient"
import { apiRoutes } from "@/shared/api/apiRoutes"
import type { RolesWithPermissions } from "../model/types";
import { useQuery } from "@tanstack/react-query";
import { getRolesWithPermissionsQueryKey } from "@/shared/constants/consts";

const fetchRolesWithPermissions = async () => {
  const response = await apiClient.get<RolesWithPermissions[]>(apiRoutes.users.roles);
  return response.data
}

export const useGetRolesWithPermissions = () => useQuery({
  queryKey: [getRolesWithPermissionsQueryKey],
  queryFn: fetchRolesWithPermissions,
})
