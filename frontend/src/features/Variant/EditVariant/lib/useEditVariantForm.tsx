import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { FormikConfig } from 'formik';
import type { EditVariantFormState } from '../model/types';
import { useEditVariantApi } from '../api/useEditVariantApi';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import type { Variant } from '@/entities/Variant';
import { VariantPayloadType } from '@/shared/types/enums';

export const useEditVariantForm = (variant: Variant, onClose: () => void) => {
  const { projectId, featureFlagId } = useParams();

  const { mutateAsync, isPending } = useEditVariantApi(projectId, featureFlagId);

  const initialValues: EditVariantFormState = useMemo(
    () => ({
      name: variant.name,
      description: variant.description ?? '',
      payloadType: variant.payloadType ?? VariantPayloadType.STRING,
      payload: variant.payload ?? '',
      colorTag: variant.colorTag ?? '',
      projectId: projectId ?? '',
    }),
    [variant, projectId],
  );

  const submitForm: FormikConfig<EditVariantFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await mutateAsync({ variantId: variant.id, data: values });
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

  return { initialValues, submitForm, isPending };
};
