import { useMemo } from 'react';
import { useGetOrganization } from '@/entities/Organization/api/useGetOrganization';
import { editOrganizationFormDefaultState } from './consts';
import { useEditOrganizationApi } from '../api/useEditOrganizationApi';
import type { FormikConfig } from 'formik';
import type { EditOrganizationFormState } from '../model/types';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';

export const useEditOrganizationForm = () => {
  const { mutateAsync, isPending } = useEditOrganizationApi();
  const { data: organization, isLoading: isLoadingOrganization } =
    useGetOrganization();
  const initialValues: EditOrganizationFormState = useMemo(() => {
    if (organization) {
      return {
        organizationId: organization.id,
        name: organization.name,
        url: organization.url ?? '',
        description: organization.description ?? '',
      };
    }
    return editOrganizationFormDefaultState;
  }, [organization]);

  const isLoading = isLoadingOrganization || isPending;

  const submitForm: FormikConfig<EditOrganizationFormState>['onSubmit'] =
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

  return {
    initialValues,
    isLoading,
    submitForm,
  };
};
