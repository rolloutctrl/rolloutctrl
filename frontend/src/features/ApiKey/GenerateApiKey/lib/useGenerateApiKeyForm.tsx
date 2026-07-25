import { useState } from 'react';
import { generateApiKeyFormDefaultState } from './consts';
import type { GenerateApiKeyFormState } from '../model/types';
import { useGenerateApiKeyApi } from '../api/useGenerateApiKeyApi';
import { useParams } from 'react-router-dom';
import type { FormikConfig } from 'formik';
import { notifications } from '@mantine/notifications';
import { useGetEnvironmentsByProjectId } from '@/entities/Environment';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useGenerateApiKeyForm = () => {
  const { projectId } = useParams();
  const [initialValues] = useState<GenerateApiKeyFormState>(
    () => generateApiKeyFormDefaultState,
  );
  const [rawKey, setRawKey] = useState<string | null>(null);

  const { data: environments, isLoading: isLoadingEnvironments } = useGetEnvironmentsByProjectId(projectId);

  const { mutateAsync, isPending } = useGenerateApiKeyApi(projectId || '');

  const submitForm: FormikConfig<GenerateApiKeyFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      const result = await mutateAsync(values);
      if (result.key) {
        setRawKey(result.key);
      }
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

  const environmentOptions = (environments || [])?.map((env) => ({
    value: env.id,
    label: env.name,
  }))

  const isLoading = isLoadingEnvironments || isPending;

  return {
    initialValues,
    isLoading,
    submitForm,
    rawKey,
    environmentOptions,
  };
};
