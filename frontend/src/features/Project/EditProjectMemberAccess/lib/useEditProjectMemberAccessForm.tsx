import type { ProjectMember } from '@/entities/Project';
import type { Nullable } from '@/shared/types/types';
import { useMemo } from 'react';
import type { EditProjectMemberAccessFormState } from '../model/types';
import { TeamRole } from '@/shared/types/enums';
import { useEditProjectMemberAccessApi } from '../api/useEditProjectMemberAccessApi';
import { useParams } from 'react-router-dom';
import type { FormikConfig } from 'formik';

export const useEditProjectMemberAccessForm = (
  projectMember: Nullable<ProjectMember>,
  currentUserId: string | undefined,
) => {
  const { projectId } = useParams();
  const { mutateAsync, isPending } = useEditProjectMemberAccessApi(projectId || '');
  const initialValues: EditProjectMemberAccessFormState = useMemo(() => {
    if (projectMember) {
      return {
        projectMemberId: projectMember.id,
        role: projectMember.role as TeamRole,
      };
    }
    return {
      projectMemberId: '',
      role: TeamRole.VIEWER,
    };
  }, [projectMember]);

  const submitForm: FormikConfig<EditProjectMemberAccessFormState>['onSubmit'] = async (
    values,
  ) => {
    await mutateAsync(values);
  };

  const teamRoleOptions = Object.values(TeamRole).map((role) => ({
      value: role,
      label: role,
    }));

  const isDisabled = currentUserId === projectMember?.userId;

  return {
    initialValues,
    isPending,
    submitForm,
    teamRoleOptions,
    isDisabled,
  };
};
