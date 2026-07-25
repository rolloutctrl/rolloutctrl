import type { FormikConfig } from 'formik';
import type { AddOrganizationMemberFormState } from '../model/types';
import { useMemo } from 'react';
import { addOrganizationMemberFormDefaultState } from './consts';
import { notifications } from '@mantine/notifications';
import { useAddOrganizationMemberApi } from '../api/useAddOrganizationMemberApi';
import { OrganizationRole, TeamRole } from '@/shared/types/enums';
import { useGetProjects } from '@/entities/Project';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useGetCurrentUser } from '@/entities/User';

export const useAddOrganizationMemberForm = (onClose: () => void) => {
  const { isAuthenticated } = useAuthContext();
  const { data: currentUser } = useGetCurrentUser(isAuthenticated);
  const initialValues: AddOrganizationMemberFormState = useMemo(() => {
    if (currentUser?.organizationId) {
      return {
        ...addOrganizationMemberFormDefaultState,
        organizationId: currentUser?.organizationId,
      };
    }
    return addOrganizationMemberFormDefaultState;
  }, [currentUser?.organizationId]);

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects();

  const { mutateAsync, isPending } = useAddOrganizationMemberApi();

  const submitForm: FormikConfig<AddOrganizationMemberFormState>['onSubmit'] =
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
