import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { EditEnvironmentFormState } from '../model/types';
import { editEnvironmentFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useEditEnvironmentApi } from '../api/useEditEnvironmentApi';
import { useGetEnvironmentById } from '@/entities/Environment';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useEditEnvironmentForm = (
  environmentId: string,
  onClose: () => void,
) => {
  const { projectId } = useParams();

  const { data: environment } = useGetEnvironmentById(projectId, environmentId);

  const initialValues = useMemo<EditEnvironmentFormState>(() => {
    if (environment) {
      const { id, project, name } = environment;
      return {
        projectId: project.slug,
        environmentId: id,
        name,
      };
    }

    return {
      ...editEnvironmentFormDefaultState,
      projectId: projectId || '',
    };
  }, [environment, projectId]);

  const { mutateAsync, isPending } = useEditEnvironmentApi();

  const submitForm: FormikConfig<EditEnvironmentFormState>['onSubmit'] = async (
    values,
  ) => {
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

  return {
    initialValues,
    submitForm,
    isPending,
  };
};
