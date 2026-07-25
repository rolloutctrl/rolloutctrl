import { useMemo } from 'react';
import type { CollectContextsFormState } from '../model/types';
import { useParams } from 'react-router-dom';
import { useGetProjectById } from '@/entities/Project';
import { collectContextsFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import { useCollectContextsApi } from '../api/useCollectContextsApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useCollectContextsForm = () => {
  const { projectId } = useParams();

  const { data: project, isLoading: isLoadingProject } = useGetProjectById(projectId);

  const { mutateAsync, isPending } = useCollectContextsApi(projectId);
  const initialValues: CollectContextsFormState = useMemo(() => {
    if (project) {
      return {
        isEnabled: project.contextSettings.collectContexts,
        allowedAttributes: project.contextSettings.allowedAttributes,
      };
    }
    return collectContextsFormDefaultState;
  }, [project]);

  const submitForm: FormikConfig<CollectContextsFormState>['onSubmit'] =
      async (values) => {
        try {
          await mutateAsync(values);
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

  const isLoading = isLoadingProject || isPending;
  return {
    initialValues,
    submitForm,
    isLoading,
  };
};
