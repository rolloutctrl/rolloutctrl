import { useMemo } from 'react';
import { createFeatureFlagFormDefaultState } from './consts';
import type {
  CreateFeatureFlagBody,
  CreateFeatureFlagFormState,
} from '../model/types';
import type { FormikConfig } from 'formik';
import { useCreateFeatureFlagApi } from '../api/useCreateFeatureFlagApi';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useCreateFeatureFlagForm = (onClose: () => void) => {
  const { projectId } = useParams();

  const initialValues = useMemo<CreateFeatureFlagFormState>(
    () => ({
      ...createFeatureFlagFormDefaultState,
      projectId: projectId || '',
    }),
    [projectId],
  );

  const { mutateAsync, isPending } = useCreateFeatureFlagApi();

  const submitForm: FormikConfig<CreateFeatureFlagFormState>['onSubmit'] =
    async (values) => {
      try {
        const { flags, type, projectId, ...rest } = values;
        const body: CreateFeatureFlagBody = {
          projectId,
          type: type as 'single' | 'multiple',
          ...(type === 'single' ? rest : {}),
          ...(type === 'multiple' && flags ? { flags: JSON.parse(flags) } : {}),
        };
        await mutateAsync(body);
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
