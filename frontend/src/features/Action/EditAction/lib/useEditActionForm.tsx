import { useMemo } from 'react';
import type { FormikConfig } from 'formik';
import { useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useGetSegmentsByProjectId } from '@/entities/Segment';
import { useUpdateActionApi } from '../api/useUpdateActionApi';
import type {
  EditActionFormState,
  EditActionStrategyFormState,
} from '../model/types';
import type { Action } from '@/entities/Action';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';
import { Operator } from '@/shared/types/enums';

type UseEditActionFormProps = {
  action: Action;
  onClose: () => void;
};

export const useEditActionForm = ({
  action,
  onClose,
}: UseEditActionFormProps) => {
  const { projectId } = useParams();

  const { mutateAsync: updateAction, isPending } = useUpdateActionApi(
    action.id,
    projectId,
  );

  const { data: segments, isLoading: isSegmentsLoading } =
    useGetSegmentsByProjectId(projectId);

  const initialValues = useMemo<EditActionFormState>(
    () => ({
      key: action.key,
      description: action.description ?? '',
      enabled: action.enabled,
      defaultEffect: action.defaultEffect,
      strategies: action.strategies.map((s) => ({
        id: s.id,
        name: s.name ?? '',
        priority: s.priority,
        enabled: s.enabled,
        effect: s.effect,
        segmentId: s.segmentId ?? undefined,
        matchType: s.matchType,
        rules: (s.rules || [])?.map((r) => {
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
            id: r.id,
            field: r.field,
            operator,
            value,
            not: r.not,
          };
        }),
      })),
    }),
    [action],
  );

  const submitForm: FormikConfig<EditActionFormState>['onSubmit'] = async (
    values,
  ) => {
    try {
      await updateAction({
        key: values.key,
        description: values.description,
        enabled: values.enabled,
        defaultEffect: values.defaultEffect,
        strategies: values.strategies.map((strategy) => ({
          id: strategy.id,
          effect: strategy.effect,
          priority: strategy.priority,
          enabled: strategy.enabled ?? true,
          segmentIds: strategy.segmentId ? [strategy.segmentId] : undefined,
          matchType: strategy.matchType,
          rules: strategy.rules.map((rule) => ({
            id: rule.id,
            field: rule.field,
            operator: rule.operator,
            value: Array.isArray(rule.value)
              ? JSON.stringify(rule.value)
              : rule.value,
            not: rule.not ?? false,
          })),
        })),
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

  const segmentOptions = (segments || []).map((segment) => ({
    value: segment.id,
    label: segment.name,
  }));

  const getDefaultStrategy = (): EditActionStrategyFormState => ({
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
    isPending,
    segmentOptions,
    isSegmentsLoading,
    getDefaultStrategy,
  };
};
