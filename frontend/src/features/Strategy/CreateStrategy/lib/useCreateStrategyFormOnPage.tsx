import { useMemo, useState } from 'react';
import { createStrategyFormDefaultState, strategyPresetLabels, type StrategyPreset } from './consts';
import type { CreateStrategyFormState } from '../model/types';
import type { FormikConfig } from 'formik';
import { useCreateStrategyApi } from '../api/useCreateStrategyApi';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { useTimezoneOptions } from '@/entities/Strategy';

export const useCreateStrategyFormOnPage = (needRedirect?: boolean) => {
  const navigate = useNavigate();
  const { projectId, featureFlagId } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedPreset, setSelectedPreset] =
    useState<StrategyPreset>('standard');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const initialEnvironment = searchParams.get('env');

  const initialValues = useMemo<CreateStrategyFormState>(() => {
    if (initialEnvironment) {
      return {
        ...createStrategyFormDefaultState,
        projectId: projectId ?? '',
        featureFlagEnvironmentIds: [initialEnvironment],
      };
    }
    return { ...createStrategyFormDefaultState, projectId: projectId ?? '' };
  }, [initialEnvironment, projectId]);

  const { data: currentFlag } = useGetFeatureFlagById(projectId, featureFlagId);

  const timezoneOptions = useTimezoneOptions();

  const { mutateAsync, isPending } = useCreateStrategyApi(
    projectId,
    featureFlagId,
    needRedirect,
  );

  const { data: segments, isLoading: isSegmentsLoading } =
    useGetSegmentsByProjectId(projectId);

  const submitForm: FormikConfig<CreateStrategyFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      const { name, ...rest } = values;
      const data = {
        name: name || strategyPresetLabels[selectedPreset],
        ...rest,
      };
      await mutateAsync(data);
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

  const segmentOptions = (segments || [])?.map((segment) => ({
    value: segment.id,
    label: segment.name,
  }));

  const environmentOptions = (currentFlag?.environments || [])
    ?.map((env) => ({
      value: env.id,
      label: env.environment.name,
    }))
    ?.sort((a, b) => a.label.localeCompare(b.label));

  const handleBack = () => {
    const envParam = initialEnvironment ? `?env=${initialEnvironment}` : '';
    navigate(`/project/${projectId}/feature-flags/${featureFlagId}${envParam}`);
  };

  return {
    initialValues,
    submitForm,
    isPending,
    environmentOptions,
    segments: segments ?? [],
    segmentOptions,
    selectedPreset,
    setSelectedPreset,
    scheduleOpen,
    setScheduleOpen,
    isSegmentsLoading,
    timezoneOptions,
    handleBack,
  };
};
