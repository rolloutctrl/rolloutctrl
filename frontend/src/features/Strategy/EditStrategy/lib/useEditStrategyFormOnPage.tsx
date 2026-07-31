import { useMemo } from 'react';
import { editStrategyFormDefaultState } from './consts';
import type { EditStrategyFormState } from '../model/types';
import type { FormikConfig } from 'formik';
import { useEditStrategyApi } from '../api/useEditStrategyApi';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { notifications } from '@mantine/notifications';
import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { Operator } from '@/shared/types/enums';
import { useGetStrategyById, useTimezoneOptions } from '@/entities/Strategy';
import { DateTime } from 'luxon';

export const useEditStrategyFormOnPage = () => {
  const navigate = useNavigate();
  const { projectId, featureFlagId, strategyId } = useParams();

  const { data: currentFlag, isLoading: isFlagLoading } = useGetFeatureFlagById(
    projectId,
    featureFlagId,
  );

  const timezoneOptions = useTimezoneOptions();

  const { data: currentStrategy, isLoading: isLoadingStrategy } =
    useGetStrategyById(strategyId);

  const initialValues = useMemo<EditStrategyFormState>(() => {
    if (!currentStrategy) return editStrategyFormDefaultState;

    const startsAt =
      currentStrategy.startsAt && currentStrategy.timezone
        ? DateTime.fromISO(currentStrategy.startsAt.toString())
            .setZone(currentStrategy.timezone)
            .toFormat('yyyy-MM-dd HH:mm:ss')
        : null;

    const endsAt =
      currentStrategy.endsAt && currentStrategy.timezone
        ? DateTime.fromISO(currentStrategy.endsAt.toString())
            .setZone(currentStrategy.timezone)
            .toFormat('yyyy-MM-dd HH:mm:ss')
        : null;

    return {
      projectId: projectId ?? '',
      featureFlagEnvironmentIds: [currentStrategy.featureFlagEnvironmentId],
      name: currentStrategy.name ?? '',
      isDefault: currentStrategy.isDefault ?? false,
      rolloutPercentage: currentStrategy.rolloutPercentage ?? undefined,
      rolloutStickinessField:
        currentStrategy.rolloutStickinessField ?? undefined,
      segmentIds: currentStrategy.segments.map((s) => s.id),
      priority: currentStrategy.priority,
      timezone: currentStrategy.timezone ?? undefined,
      startsAt,
      endsAt,
      rules: (currentStrategy.rules || [])?.map((r) => {
        const operator = r.operator as Operator;
        const isArrayOp =
          operator === Operator.IN || operator === Operator.INCLUDES;
        let value: string | string[] = r.value;
        if (isArrayOp && typeof r.value === 'string') {
          try {
            value = JSON.parse(r.value);
          } catch {
            value = [];
          }
        }
        return {
          field: r.field,
          operator,
          value,
          not: r.not,
        };
      }),
    };
  }, [currentStrategy, projectId]);

  const { mutateAsync, isPending } = useEditStrategyApi(
    strategyId,
    projectId,
    featureFlagId,
  );

  const { data: segments, isLoading: isSegmentsLoading } =
    useGetSegmentsByProjectId(projectId);

  const submitForm: FormikConfig<EditStrategyFormState>['onSubmit'] = async (
    values,
  ) => {
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

  const environmentOptions = (currentFlag?.environments || [])
    .map((env) => ({
      value: env.id,
      label: env.environment.name,
    }))
    ?.sort((a, b) => a.label.localeCompare(b.label));

  const handleBack = () => {
    const envParam = currentStrategy?.featureFlagEnvironmentId
      ? `?env=${currentStrategy.featureFlagEnvironmentId}`
      : '';
    navigate(`/project/${projectId}/feature-flags/${featureFlagId}${envParam}`);
  };

  const isLoading = isLoadingStrategy || isFlagLoading;

  return {
    initialValues,
    submitForm,
    isPending,
    isFlagLoading,
    currentStrategy,
    isLoading,
    environmentOptions,
    segments: segments ?? [],
    isSegmentsLoading,
    handleBack,
    currentFlag,
    timezoneOptions,
  };
};
