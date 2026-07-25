import { useMemo } from 'react';
import type { EditProjectFormState } from '../model/types';
import { editProjectFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useEditProjectApi } from '../api/useEditProjectApi';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { useGetProjectById } from '@/entities/Project';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useEditProjectForm = (onClose?: () => void) => {
  const { projectId } = useParams();

  const { data: currentProject, isLoading } = useGetProjectById(projectId);
  const initialValues: EditProjectFormState = useMemo(() => {
    if (currentProject) {
      return {
        projectId: currentProject.id,
        name: currentProject.name,
        slug: currentProject.slug,
        description: currentProject.description,
      };
    }
    return editProjectFormDefaultState;
  }, [currentProject]);

  const { mutateAsync, isPending } = useEditProjectApi();

  const submitForm: FormikConfig<EditProjectFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await mutateAsync(values);
      onClose?.();
    } catch (error) {
      const message = getErrorMessage(error);
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Project update failed',
        message,
        color: 'red',
      });
    }
  };

  return {
    initialValues,
    submitForm,
    isPending,
    isLoading,
  };
};
