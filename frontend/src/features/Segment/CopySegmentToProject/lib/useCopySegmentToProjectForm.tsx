import { useMemo } from 'react';
import { copySegmentToProjectFormDefaultState } from './consts';
import type { FormikConfig } from 'formik';
import type { CopySegmentToProjectFormState } from '../model/types';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import { useGetProjects } from '@/entities/Project';
import { useCopySegmentToProjectApi } from '../api/useCopySegmentToProjectApi';
import { useParams } from 'react-router-dom';

export const useCopySegmentToProjectForm = (
  onClose: () => void,
  segmentId?: string,
) => {
  const { projectId } = useParams();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects();
  const initialValues = useMemo<CopySegmentToProjectFormState>(() => {
    if (segmentId) {
      return {
        projectId: '',
        segmentId,
      };
    }
    return copySegmentToProjectFormDefaultState;
  }, [segmentId]);

  const { mutateAsync, isPending } = useCopySegmentToProjectApi();

  const submitForm: FormikConfig<CopySegmentToProjectFormState>['onSubmit'] =
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

  const projectOptions = (projects || [])
    ?.filter((project) => project.slug !== projectId)
    .map((project) => ({
      value: project.id,
      label: project.name,
    }));

  const isLoading = isProjectsLoading || isPending;
  return {
    initialValues,
    submitForm,
    projectOptions,
    isLoading,
  };
};
