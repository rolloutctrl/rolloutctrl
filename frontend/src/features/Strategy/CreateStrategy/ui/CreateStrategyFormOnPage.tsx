import { Form, Formik, FieldArray } from 'formik';
import { useParams } from 'react-router-dom';
import { useCreateStrategyFormOnPage } from '../lib/useCreateStrategyFormOnPage';
import {
  Button,
  Loader,
  Stack,
  Select,
  Group,
  Text,
  ActionIcon,
  Divider,
  Checkbox,
  Grid,
  Collapse,
  Paper,
} from '@mantine/core';
import {
  DateTimePickerField,
  SelectCreatableField,
  SelectField,
  SliderField,
  SwitchField,
  TagsInputField,
  TextField,
} from '@/shared/ui';
import { Operator } from '@/shared/types/enums';
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { CreateStrategyRuleFormState } from '../model/types';
import { SegmentsMultiSelectField } from './SegmentsMultiSelectField';
import { AssignStrategyVariantForm } from '@/features/Strategy/AssignStrategyVariant';
import {
  createStrategyFormSchema,
  STRATEGY_PRESET_DEFAULTS,
  strategyPresetOptions,
  strategyPresetDescriptions,
  type StrategyPreset,
} from '../lib/consts';
import { predefinedRuleFieldOptions } from '@/shared/constants/consts';
import type { Nullable } from '@/shared/types/types';

const operatorOptions = Object.values(Operator).map((op) => ({
  value: op,
  label: op,
}));

const ARRAY_OPERATORS: Operator[] = [Operator.IN, Operator.INCLUDES];
const isArrayOperator = (op: Operator) => ARRAY_OPERATORS.includes(op);

type CreateStrategyFormOnPageProps = {
  needRedirect?: boolean;
};

export const CreateStrategyFormOnPage = ({
  needRedirect,
}: CreateStrategyFormOnPageProps) => {
  const { projectId, featureFlagId } = useParams();
  const {
    initialValues,
    isPending,
    isSegmentsLoading,
    segments,
    environmentOptions,
    submitForm,
    handleBack,
    timezoneOptions,
    selectedPreset,
    setSelectedPreset,
    scheduleOpen,
    setScheduleOpen,
  } = useCreateStrategyFormOnPage(needRedirect);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={createStrategyFormSchema}
    >
      {({ values, setFieldValue }) => {
        const handlePresetChange = (preset: Nullable<string>) => {
          const p = preset as StrategyPreset;
          setSelectedPreset(p);
          const defaults = STRATEGY_PRESET_DEFAULTS[p];
          setFieldValue('rolloutPercentage', defaults.rolloutPercentage);
          setFieldValue(
            'rolloutStickinessField',
            defaults.rolloutStickinessField,
          );
          if (p === 'default') {
            setFieldValue('isDefault', true);
            setFieldValue('name', 'Default');
            setFieldValue('segmentIds', []);
            setFieldValue('rules', []);
            setScheduleOpen(false);
          } else {
            setFieldValue('isDefault', false);
            if (p === 'scheduled') setScheduleOpen(true);
          }
        };

        const isDefaultPreset = selectedPreset === 'default';
        const showRollout = !isDefaultPreset && selectedPreset !== 'standard';

        return (
          <Form>
            <Stack gap="md">
              <div>
                {/* <Text size="0.875rem" fw={600} mb={6}>
                  Template
                </Text> */}
                <Select
                  label="Template"
                  value={selectedPreset}
                  onChange={handlePresetChange}
                  data={strategyPresetOptions}
                  disabled={isPending}
                  className="w-1/2"
                  checkIconPosition="right"
                />
                {/* <SegmentedControl
                  value={selectedPreset}
                  onChange={handlePresetChange}
                  data={strategyPresetOptions}
                  fullWidth
                  disabled={isPending}
                  classNames={{
                    root: 'dark:!bg-dark-surface/30',
                  }}
                /> */}
                <Text size="xs" c="dimmed" mt={6}>
                  {strategyPresetDescriptions[selectedPreset]}
                </Text>
              </div>

              <Checkbox.Group
                name="featureFlagEnvironmentIds"
                value={values.featureFlagEnvironmentIds}
                onChange={(value) =>
                  setFieldValue('featureFlagEnvironmentIds', value)
                }
                label="Target environments"
                description="Choose all environments where this strategy will be applied"
              >
                <Grid columns={12} mt="md">
                  {environmentOptions?.map((item) => (
                    <Grid.Col span={4} key={item.value}>
                      <Checkbox.Card p="xs" value={item.value}>
                        <Group wrap="nowrap" gap="xs" align="center">
                          <Checkbox.Indicator />
                          <Text
                            size="sm"
                            fw={500}
                            ta="left"
                            lineClamp={1}
                            tt="capitalize"
                          >
                            {item.label}
                          </Text>
                        </Group>
                      </Checkbox.Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Checkbox.Group>

              {!isDefaultPreset && (
                <TextField
                  name="name"
                  label="Strategy name"
                  description="Optional name for this strategy"
                  disabled={isPending}
                  className="w-1/2"
                />
              )}

              {!isDefaultPreset && (
                <SegmentsMultiSelectField
                  name="segmentIds"
                  label="Segments"
                  description="Optional segments to target"
                  disabled={isPending || isSegmentsLoading}
                  segments={segments}
                />
              )}

              {showRollout && (
                <Stack gap="md">
                  <div className="flex flex-col items-start gap-1">
                    <Text size="0.875rem" fw={600}>
                      Rollout
                    </Text>
                    <Text size="xs" c="dimmed">
                      Percentage of users to target (0-100)
                    </Text>
                  </div>
                  <SliderField
                    name="rolloutPercentage"
                    disabled={isPending}
                    min={1}
                    max={100}
                    marks={[
                      { value: 1, label: '1%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' },
                    ]}
                  />
                  <TextField
                    name="rolloutStickinessField"
                    label="Stickiness field"
                    description="User attribute used to ensure consistent rollout assignment"
                    placeholder="e.g., userId, sessionId"
                    disabled={isPending}
                    className="w-1/2 mt-4"
                  />
                </Stack>
              )}

              {!isDefaultPreset && (
                <div>
                  <Button
                    type="button"
                    variant="transparent"
                    size="sm"
                    leftSection={<IconCalendar size={15} />}
                    rightSection={
                      scheduleOpen ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )
                    }
                    onClick={() => setScheduleOpen((o) => !o)}
                    disabled={isPending}
                    px={0}
                  >
                    {scheduleOpen ? 'Hide schedule' : 'Add schedule'}
                  </Button>
                  <Collapse expanded={scheduleOpen}>
                    <Group gap="md" mt="sm" align="flex-start">
                      <DateTimePickerField
                        name="startsAt"
                        label="Starts at"
                        className="flex-1"
                        leftSection={<IconCalendar size={16} />}
                        clearable
                        disabled={isPending}
                      />
                      <DateTimePickerField
                        name="endsAt"
                        label="Ends at"
                        className="flex-1"
                        leftSection={<IconCalendar size={16} />}
                        clearable
                        disabled={isPending}
                      />
                      <SelectField
                        name="timezone"
                        options={timezoneOptions}
                        label="Timezone"
                        placeholder="Select timezone"
                        disabled={isPending}
                        checkIconPosition="right"
                        clearable
                        isSearchable
                        nothingFoundMessage="Not found"
                      />
                    </Group>
                  </Collapse>
                </div>
              )}

              {!isDefaultPreset && (
                <>
                  <Divider label="Targeting Rules" labelPosition="center" />

                  <FieldArray name="rules">
                    {({ push, remove }) => (
                      <Stack gap="sm">
                        {values.rules && values.rules.length > 0 ? (
                          values.rules.map((rule, index) => (
                            <Paper
                              key={index}
                              p="md"
                              withBorder
                              className="bg-gray-100 dark:bg-dark-bg"
                            >
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Text component="span" fw={500} size="md">
                                    Rule {index + 1}
                                  </Text>
                                  <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    onClick={() => remove(index)}
                                    disabled={isPending}
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Group>
                                <Group gap="xs" grow align="start">
                                  <SelectCreatableField
                                    name={`rules.${index}.field`}
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
                                        setFieldValue(
                                          `rules.${index}.operator`,
                                          op,
                                        );
                                        setFieldValue(
                                          `rules.${index}.value`,
                                          isArrayOperator(op) ? [] : '',
                                        );
                                      }}
                                      checkIconPosition="right"
                                      disabled={isPending}
                                      required
                                    />
                                    <div className="flex flex-row items-center h-[2.25rem]">
                                      <SwitchField
                                        name={`rules.${index}.not`}
                                        label="Not"
                                        disabled={isPending}
                                      />
                                    </div>
                                  </div>
                                </Group>

                                {isArrayOperator(rule.operator) ? (
                                  <TagsInputField
                                    name={`rules.${index}.value`}
                                    label="Value"
                                    placeholder="e.g., premium, US, admin"
                                    disabled={isPending}
                                    required
                                  />
                                ) : (
                                  <TextField
                                    name={`rules.${index}.value`}
                                    label="Value"
                                    placeholder="e.g., premium, US, admin"
                                    disabled={isPending}
                                    required
                                  />
                                )}
                              </Stack>
                            </Paper>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed" ta="center">
                            No rules added yet
                          </Text>
                        )}

                        <Button
                          variant="outline"
                          leftSection={<IconPlus size={16} />}
                          onClick={() =>
                            push({
                              field: '',
                              operator: Operator.EQUALS,
                              not: false,
                              value: '',
                            } as CreateStrategyRuleFormState)
                          }
                          disabled={isPending}
                        >
                          Add Rule
                        </Button>
                      </Stack>
                    )}
                  </FieldArray>
                </>
              )}

              <Divider label="Variants" labelPosition="center" />

              <AssignStrategyVariantForm
                featureFlagId={featureFlagId}
                projectId={projectId}
                disabled={isPending}
                variants={values.variants}
                onChange={(newVariants) =>
                  setFieldValue('variants', newVariants)
                }
              />

              <div className="flex flex-row w-full items-center justify-end gap-x-2">
                <Button
                  type="button"
                  variant="light"
                  color="gray"
                  onClick={handleBack}
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
        );
      }}
    </Formik>
  );
};
