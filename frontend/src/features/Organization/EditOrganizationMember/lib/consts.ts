import { OrganizationRole } from '@/shared/types/enums';
import type { EditOrganizationMemberFormState } from '../model/types';

export const editOrganizationMemberFormDefaultState: EditOrganizationMemberFormState =
  {
    id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    role: OrganizationRole.MEMBER,
    projects: [],
  } as const;
