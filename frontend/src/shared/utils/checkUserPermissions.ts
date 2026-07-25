import { castArray } from 'lodash-es';
import { OrganizationRole, PermissionCode } from '../types/enums';
import type { ApiError } from '../types/types';

export const checkUserPermissions = (
	organizationRole: OrganizationRole,
	userPermissions: PermissionCode[],
	checkedPermissions: PermissionCode[] | PermissionCode,
) => {
	if (organizationRole === OrganizationRole.OWNER) return true;
	return userPermissions.some((permission) => {
		if (permission === PermissionCode.ALL) return true;
		return castArray(checkedPermissions).find((p: PermissionCode) => p === permission);
	});
};

export const getErrorMessage = (error: unknown): string => {
  const err = error as ApiError;
  return err?.response?.data?.message ?? err?.message ?? 'Unknown error';
}