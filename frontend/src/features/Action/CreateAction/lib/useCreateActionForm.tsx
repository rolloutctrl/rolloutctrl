import { useMemo } from 'react';
import { createActionFormDefaultState } from './consts';
import type {
  CreateActionFormState,
  CreateActionStrategyFormState,
} from '../model/types';
import type { FormikConfig } from 'formik';
import { useCreateActionApi } from '../api/useCreateActionApi';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

type UseCreateActionFormProps = {
  onClose: () => void;
};

export const useCreateActionForm = ({ onClose }: UseCreateActionFormProps) => {
  const { projectId } = useParams();

  const initialValues = useMemo<CreateActionFormState>(
    () => ({
      ...createActionFormDefaultState,
      projectId: projectId || '',
    }),
    [projectId],
  );

  const { mutateAsync: createAction, isPending: isActionPending } =
    useCreateActionApi(projectId);

  const { data: segments, isLoading: isSegmentsLoading } =
    useGetSegmentsByProjectId(projectId);

  const submitForm: FormikConfig<CreateActionFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await createAction({
        projectId: values.projectId,
        key: values.key,
        description: values.description,
        enabled: values.enabled,
        defaultEffect: values.defaultEffect,
        strategies:
          values.strategies && values.strategies.length > 0
            ? values.strategies.map((strategy) => ({
                effect: strategy.effect,
                priority: strategy.priority,
                enabled: strategy.enabled ?? true,
                segmentIds: strategy.segmentId
                  ? [strategy.segmentId]
                  : undefined,
                matchType: strategy.matchType,
                rules: strategy.rules.map((rule) => ({
                  field: rule.field,
                  operator: rule.operator,
                  value: Array.isArray(rule.value)
                    ? JSON.stringify(rule.value)
                    : rule.value,
                  not: rule.not ?? false,
                })),
              }))
            : undefined,
      });

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

  const segmentOptions = (segments || [])?.map((segment) => ({
    value: segment.id,
    label: segment.name,
  }));

  const getDefaultStrategy = (): CreateActionStrategyFormState => ({
    name: '',
    priority: undefined,
    enabled: true,
    effect: 'ALLOW' as const,
    segmentId: undefined,
    matchType: 'ALL' as const,
    rules: [],
  });

  return {
    initialValues,
    submitForm,
    isPending: isActionPending,
    segmentOptions,
    isSegmentsLoading,
    getDefaultStrategy,
  };
};
