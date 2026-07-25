import type { FormikConfig } from 'formik';
import type { EditOrganizationMemberFormState } from '../model/types';
import { useMemo } from 'react';
import { editOrganizationMemberFormDefaultState } from './consts';
import { notifications } from '@mantine/notifications';
import { OrganizationRole, TeamRole } from '@/shared/types/enums';
import { useGetProjects } from '@/entities/Project';
import { useEditOrganizationMemberApi } from '../api/useEditOrganizationMemberApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { useGetCurrentUser, type User } from '@/entities/User';
import { useAuthContext } from '@/app/providers/AuthProvider';

export const useEditOrganizationMemberForm = (
  member: User | null | undefined,
  onClose: () => void,
) => {
  const { isAuthenticated } = useAuthContext();
  const { data: currentUser } = useGetCurrentUser(isAuthenticated);
  const initialValues = useMemo<EditOrganizationMemberFormState>(() => {
    if (member) {
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        password: '',
        confirmPassword: '',
        organizationId: currentUser?.organizationId || '',
        role: member.organizationRole,
        projects: member.projectMembers.map((project) => ({
          projectId: project.projectId,
          teamRole: project.role,
        })),
      };
    }
    return editOrganizationMemberFormDefaultState;
  }, [member, currentUser]);

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects();

  const { mutateAsync, isPending } = useEditOrganizationMemberApi();

  const submitForm: FormikConfig<EditOrganizationMemberFormState>['onSubmit'] =
    async (values) => {
      try {
        await mutateAsync(values);
        onClose();
      } catch (error) {
        const message = getErrorMessage(error);
        notifications.show({
          position: 'bottom-center',
          withCloseButton: true,
          allowClose: true,
          autoClose: 3000,
          title: 'Error',
          message,
          color: 'red',
        });
      }
    };

  const organizationRolesOptions = Object.values(OrganizationRole).map(
    (role) => ({
      value: role,
      label: role,
    }),
  );

  const allProjectOptions = (projects || []).map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const teamRoleOptions = Object.values(TeamRole).map((role) => ({
    value: role,
    label: role,
  }));

  const getAvailableProjectOptions = (
    selectedProjectIds: string[],
    currentIndex: number,
  ) => {
    const otherSelected = selectedProjectIds.filter(
      (_, i) => i !== currentIndex,
    );
    return allProjectOptions.filter(
      (opt) => !otherSelected.includes(opt.value),
    );
  };

  return {
    initialValues,
    organizationRolesOptions,
    allProjectOptions,
    teamRoleOptions,
    getAvailableProjectOptions,
    submitForm,
    isLoadingProjects,
    isPending,
  };
};
