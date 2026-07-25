import * as yup from 'yup';

import { OrganizationRole, TeamRole } from '@/shared/types/enums';
import type { AddOrganizationMemberFormState } from '../model/types';

export const addOrganizationMemberFormDefaultState: AddOrganizationMemberFormState =
  {
    organizationId: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: OrganizationRole.MEMBER,
    projects: [],
  } as const;

export const addOrganizationMemberFormSchema = yup.object().shape({
  organizationId: yup.string().required('Organization ID is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must contain at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must contain at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(Object.values(OrganizationRole), 'Invalid role'),
  projects: yup
    .array()
    .of(
      yup.object().shape({
        projectId: yup.string().required('Project is required'),
        teamRole: yup
          .string()
          .required('Team role is required')
          .oneOf(Object.values(TeamRole), 'Invalid team role'),
      }),
    )
    .optional(),
});