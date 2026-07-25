import { useMemo } from 'react';
import type {
  EditSegmentFormState,
  EditSegmentRuleFormState,
} from '../model/types';
import type { FormikConfig } from 'formik';
import { useGetSegmentById } from '@/entities/Segment';
import { useParams } from 'react-router-dom';
import { useEditSegmentApi } from '../api/useEditSegmentApi';
import { uniqueId } from 'lodash-es';
import { editSegmentFormDefaultState } from './consts';
import { Operator } from '@/shared/types/enums';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '@/shared/utils/checkUserPermissions';

export const useEditSegmentForm = (segmentId: string, onClose: () => void) => {
  const { projectId } = useParams();

  const { data: segment } = useGetSegmentById(segmentId, projectId);

  const initialValues = useMemo<EditSegmentFormState>(() => {
    if (segment) {
      const { id, name, key, description, rules } = segment;
      return {
        id,
        name,
        key,
        description,
        projectId: projectId || '',
        rules: (rules || [])?.map((rule) => {
          const operator = rule.operator as Operator;
          const isArrayOp =
            operator === Operator.IN || operator === Operator.INCLUDES;
          let value: string | string[] = rule.value;
          if (isArrayOp && typeof rule.value === 'string') {
            try {
              value = JSON.parse(rule.value);
            } catch {
              value = [];
            }
          }
          return {
            id: rule.id,
            field: rule.field,
            operator,
            value,
            not: rule.not,
            priority: rule.priority,
          };
        }),
      };
    }

    return {
      ...editSegmentFormDefaultState,
      projectId: projectId || '',
    };
  }, [segment, projectId]);

  const { mutateAsync, isPending } = useEditSegmentApi(projectId || '');

  // useEffect(() => {
  //   if (segment) {
  //     const { id, name, key, description, rules } = segment;
  //     setInitialValues(() => ({
  //       id,
  //       name,
  //       key,
  //       description,
  //       projectId,
  //       rules: rules.map((rule) => ({
  //         id: rule.id,
  //         field: rule.field,
  //         operator: rule.operator,
  //         value: rule.value,
  //         priority: rule.priority,
  //       })),
  //     }));
  //   }
  // }, [projectId, segment]);

  const submitForm: FormikConfig<EditSegmentFormState>['onSubmit'] = async (
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

  const newSegmentRule = {
    id: uniqueId('segment-rule'),
    field: '',
    operator: Operator.EQUALS,
    value: '',
    not: false,
  } as EditSegmentRuleFormState;

  return {
    initialValues,
    submitForm,
    isPending,
    newSegmentRule,
  };
};
