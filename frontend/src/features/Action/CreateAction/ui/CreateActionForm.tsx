import { Form, Formik, FieldArray } from 'formik';
import { useCreateActionForm } from '../lib/useCreateActionForm';
import {
  Button,
  Loader,
  Stack,
  NumberInput,
  Select,
  Group,
  Text,
  ActionIcon,
  Divider,
  Switch,
  Paper,
} from '@mantine/core';
import {
  TextField,
  TextAreaField,
  SelectCreatableField,
  TagsInputField,
} from '@/shared/ui';
import { ActionEffect, MatchType, Operator } from '@/shared/types/enums';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { CreateActionStrategyRuleFormState } from '../model/types';
import { predefinedRuleFieldOptions } from '@/shared/constants/consts';

type CreateActionFormProps = {
  onClose: () => void;
};

const operatorOptions = Object.values(Operator).map((op) => ({
  value: op,
  label: op,
}));

const effectOptions = Object.values(ActionEffect).map((effect) => ({
  value: effect,
  label: effect,
}));

const matchTypeOptions = Object.values(MatchType).map((type) => ({
  value: type,
  label: type,
}));

const ARRAY_OPERATORS: Operator[] = [Operator.IN, Operator.INCLUDES];
const isArrayOperator = (op: Operator) => ARRAY_OPERATORS.includes(op);

export const CreateActionForm = ({ onClose }: CreateActionFormProps) => {
  const {
    initialValues,
    isPending,
    isSegmentsLoading,
    segmentOptions,
    submitForm,
    getDefaultStrategy,
  } = useCreateActionForm({ onClose });

  return (
    <Formik initialValues={initialValues} onSubmit={submitForm}>
      {({ values, setFieldValue }) => (
        <Form>
          <Stack gap="md">
            {/* Action Basic Info */}
            <TextField
              name="key"
              label="Action Key"
              className="w-1/2"
              placeholder="user.edit"
              description="Unique identifier for the action"
              required
              disabled={isPending}
            />

            <TextAreaField
              name="description"
              label="Description (Optional)"
              description="Optional description for this action"
              disabled={isPending}
            />

            <Select
              label="Default Effect"
              description="Default effect when no strategy matches"
              data={effectOptions}
              className="w-1/2"
              value={values.defaultEffect}
              inputWrapperOrder={['label', 'description', 'input', 'error']}
              onChange={(value) => setFieldValue('defaultEffect', value)}
              checkIconPosition="right"
              disabled={isPending}
              required
            />

            <div className="flex flex-row items-center gap-2">
              <Switch
                label="Action enabled"
                checked={values.enabled}
                onChange={(event) =>
                  setFieldValue('enabled', event.currentTarget.checked)
                }
                disabled={isPending}
              />
            </div>

            <Divider label="Strategies" labelPosition="center" />

            {/* Strategies Array */}
            <FieldArray name="strategies">
              {({ push, remove }) => (
                <Stack gap="sm">
                  {values.strategies && values.strategies.length > 0 ? (
                    values.strategies.map((strategy, strategyIndex) => (
                      <Paper key={strategyIndex} p="sm" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
                              Strategy {strategyIndex + 1}
                            </Text>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => remove(strategyIndex)}
                              disabled={isPending}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>

                          <TextField
                            name={`strategies.${strategyIndex}.name`}
                            label="Strategy Name (Optional)"
                            placeholder="e.g., Premium Users"
                            disabled={isPending}
                          />

                          <NumberInput
                            label="Priority (Optional)"
                            description="Higher priority strategies are evaluated first"
                            min={0}
                            value={strategy.priority}
                            inputWrapperOrder={[
                              'label',
                              'description',
                              'input',
                              'error',
                            ]}
                            onChange={(value) =>
                              setFieldValue(
                                `strategies.${strategyIndex}.priority`,
                                value || undefined,
                              )
                            }
                            disabled={isPending}
                          />

                          <div className="flex flex-row items-center gap-2">
                            <Switch
                              label="Strategy enabled"
                              checked={strategy.enabled ?? true}
                              onChange={(event) =>
                                setFieldValue(
                                  `strategies.${strategyIndex}.enabled`,
                                  event.currentTarget.checked,
                                )
                              }
                              disabled={isPending}
                            />
                          </div>

                          <Select
                            label="Effect"
                            description="Effect when this strategy matches"
                            data={effectOptions}
                            value={strategy.effect}
                            onChange={(value) =>
                              setFieldValue(
                                `strategies.${strategyIndex}.effect`,
                                value,
                              )
                            }
                            checkIconPosition="right"
                            inputWrapperOrder={[
                              'label',
                              'description',
                              'input',
                              'error',
                            ]}
                            disabled={isPending}
                            required
                          />

                          <Select
                            label="Segment (Optional)"
                            description="Target specific segment"
                            data={segmentOptions}
                            value={strategy.segmentId || null}
                            inputWrapperOrder={[
                              'label',
                              'description',
                              'input',
                              'error',
                            ]}
                            onChange={(value) =>
                              setFieldValue(
                                `strategies.${strategyIndex}.segmentId`,
                                value || undefined,
                              )
                            }
                            checkIconPosition="right"
                            disabled={isPending || isSegmentsLoading}
                            clearable
                          />

                          <Select
                            label="Match Type"
                            description="How rules should be matched"
                            data={matchTypeOptions}
                            value={strategy.matchType}
                            inputWrapperOrder={[
                              'label',
                              'description',
                              'input',
                              'error',
                            ]}
                            onChange={(value) =>
                              setFieldValue(
                                `strategies.${strategyIndex}.matchType`,
                                value,
                              )
                            }
                            checkIconPosition="right"
                            disabled={isPending}
                            required
                          />

                          <Divider
                            label="Strategy Rules"
                            labelPosition="center"
                          />

                          {/* Rules Array for each Strategy */}
                          <FieldArray
                            name={`strategies.${strategyIndex}.rules`}
                          >
                            {({ push: pushRule, remove: removeRule }) => (
                              <Stack gap="xs">
                                {strategy.rules && strategy.rules.length > 0 ? (
                                  strategy.rules.map((rule, ruleIndex) => (
                                    <Paper
                                      key={ruleIndex}
                                      p="xs"
                                      withBorder
                                      className="bg-gray-100 dark:bg-dark-bg"
                                    >
                                      <Stack gap="xs">
                                        <Group justify="space-between">
                                          <Text size="xs" fw={500}>
                                            Rule {ruleIndex + 1}
                                          </Text>
                                          <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            size="sm"
                                            onClick={() =>
                                              removeRule(ruleIndex)
                                            }
                                            disabled={isPending}
                                          >
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>

                                        <Group gap="xs" grow align="start">
                                          <SelectCreatableField
                                            name={`strategies.${strategyIndex}.rules.${ruleIndex}.field`}
                                            label="Field"
                                            placeholder="e.g., email, country, plan"
                                            disabled={isPending}
                                            required
                                            options={predefinedRuleFieldOptions}
                                          />
                                          <div className="flex flex-row w-full items-end gap-x-2">
                                            <Select
                                              label="Operator"
                                              data={operatorOptions}
                                              value={rule.operator}
                                              onChange={(value) => {
                                                const op = value as Operator;
                                                const valuePath = `strategies.${strategyIndex}.rules.${ruleIndex}`;
                                                setFieldValue(
                                                  `${valuePath}.operator`,
                                                  op,
                                                );
                                                setFieldValue(
                                                  `${valuePath}.value`,
                                                  isArrayOperator(op) ? [] : '',
                                                );
                                              }}
                                              checkIconPosition="right"
                                              inputWrapperOrder={[
                                                'label',
                                                'description',
                                                'input',
                                                'error',
                                              ]}
                                              disabled={isPending}
                                              required
                                              size="sm"
                                            />
                                            <div className="flex flex-row items-center h-[2.25rem]">
                                              <Switch
                                                label="Not"
                                                checked={rule.not ?? false}
                                                onChange={(event) =>
                                                  setFieldValue(
                                                    `strategies.${strategyIndex}.rules.${ruleIndex}.not`,
                                                    event.currentTarget.checked,
                                                  )
                                                }
                                                disabled={isPending}
                                                size="sm"
                                              />
                                            </div>
                                          </div>
                                        </Group>
                                        {isArrayOperator(rule.operator) ? (
                                          <TagsInputField
                                            name={`strategies.${strategyIndex}.rules.${ruleIndex}.value`}
                                            label="Value"
                                            placeholder="e.g., premium, US, admin"
                                            disabled={isPending}
                                            required
                                          />
                                        ) : (
                                          <TextField
                                            name={`strategies.${strategyIndex}.rules.${ruleIndex}.value`}
                                            label="Value"
                                            placeholder="e.g., premium, US, admin"
                                            disabled={isPending}
                                            required
                                          />
                                        )}
                                        {/* <TextField
                                          name={`strategies.${strategyIndex}.rules.${ruleIndex}.value`}
                                          label="Value"
                                          placeholder="e.g., premium, US, admin"
                                          disabled={isPending}
                                          required
                                        /> */}
                                      </Stack>
                                    </Paper>
                                  ))
                                ) : (
                                  <Text size="xs" c="dimmed" ta="center">
                                    No rules added yet
                                  </Text>
                                )}

                                <Button
                                  variant="outline"
                                  size="xs"
                                  leftSection={<IconPlus size={14} />}
                                  onClick={() =>
                                    pushRule({
                                      field: '',
                                      operator: Operator.EQUALS,
                                      not: false,
                                      value: '',
                                    } as CreateActionStrategyRuleFormState)
                                  }
                                  disabled={isPending}
                                >
                                  Add Rule
                                </Button>
                              </Stack>
                            )}
                          </FieldArray>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Text size="sm" c="dimmed" ta="center">
                      No strategies added yet
                    </Text>
                  )}

                  <Button
                    variant="outline"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => push(getDefaultStrategy())}
                    disabled={isPending}
                  >
                    Add Strategy
                  </Button>
                </Stack>
              )}
            </FieldArray>

            <div className="flex flex-row w-full items-center justify-end gap-x-2">
              <Button
                type="button"
                variant="light"
                color="gray"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="light" disabled={isPending}>
                {isPending ? <Loader size="xs" color="white" /> : 'Create'}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
