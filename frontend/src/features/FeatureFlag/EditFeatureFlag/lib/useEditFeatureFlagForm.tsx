import { useMemo } from 'react';
import { editFeatureFlagFormDefaultState } from './consts';
import type { EditFeatureFlagFormState } from '../model/types';
import type { FormikConfig } from 'formik';
import { useParams } from 'react-router-dom';
import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { useEditFeatureFlagApi } from '../api/useEditFeatureFlagApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useEditFeatureFlagForm = (
  flagKey: string,
  onClose: () => void,
) => {
  const { projectId } = useParams();

  const { data: featureFlag } = useGetFeatureFlagById(projectId, flagKey);

  const { mutateAsync, isPending } = useEditFeatureFlagApi(flagKey);

  const initialValues = useMemo<EditFeatureFlagFormState>(() => {
    if (featureFlag) {
      const { id, key, description, archived } = featureFlag;
      return {
        flagId: id,
        key,
        description,
        projectId: projectId || '',
        archived,
      };
    }

    return {
      ...editFeatureFlagFormDefaultState,
      projectId: projectId || '',
    };
  }, [featureFlag, projectId]);

  const submitForm: FormikConfig<EditFeatureFlagFormState>['onSubmit'] = async (
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
