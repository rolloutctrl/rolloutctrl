import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../constants/permissions.constants';

export const REQUIRED_PERMISSIONS_KEY = 'required-permissions';

export const RequiredPermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
