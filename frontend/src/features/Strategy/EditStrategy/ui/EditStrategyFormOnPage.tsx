import { useState } from 'react';
import { Form, Formik, FieldArray } from 'formik';
import { useEditStrategyFormOnPage } from '../lib/useEditStrategyFormOnPage';
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
  // SegmentedControl,
  Collapse,
  Center,
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
import type { EditStrategyRuleFormState } from '../model/types';
import { SegmentsMultiSelectField } from '@/features/Strategy/CreateStrategy/ui/SegmentsMultiSelectField';
import { AssignStrategyVariantForm } from '@/features/Strategy/AssignStrategyVariant';
import { useParams } from 'react-router-dom';
import {
  STRATEGY_PRESET_DEFAULTS,
  strategyPresetOptions,
  strategyPresetDescriptions,
  type StrategyPreset,
} from '@/features/Strategy/CreateStrategy/lib/consts';
import { editStrategyFormSchema } from '../lib/consts';
import { predefinedRuleFieldOptions } from '@/shared/constants/consts';
import type { Nullable } from '@/shared/types/types';

const operatorOptions = Object.values(Operator).map((op) => ({
  value: op,
  label: op,
}));

const ARRAY_OPERATORS: Operator[] = [Operator.IN, Operator.INCLUDES];
const isArrayOperator = (op: Operator) => ARRAY_OPERATORS.includes(op);

export const EditStrategyFormOnPage = () => {
  const { isLoading } = useEditStrategyFormOnPage();

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  return <EditStrategyFormContent />;
};

const EditStrategyFormContent = () => {
  const { strategyId, projectId, featureFlagId } = useParams();
  const {
    initialValues,
    isPending,
    isSegmentsLoading,
    segments,
    environmentOptions,
    timezoneOptions,
    submitForm,
    handleBack,
  } = useEditStrategyFormOnPage();

  const [selectedPreset, setSelectedPreset] = useState<StrategyPreset>(() =>
    initialValues.isDefault ? 'default' : 'standard',
  );
  const [scheduleOpen, setScheduleOpen] = useState(
    () => !!(initialValues.startsAt || initialValues.endsAt),
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      enableReinitialize
      validationSchema={editStrategyFormSchema}
    >
      {({ values, setFieldValue, dirty }) => {
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
        const showRollout =
          !isDefaultPreset &&
          (selectedPreset !== 'standard' ||
            values.rolloutPercentage !== undefined);
        return (
          <Form>
            <Stack gap="md">
              <div>
                <Select
                  label="Template"
                  value={selectedPreset}
                  onChange={handlePresetChange}
                  data={strategyPresetOptions}
                  disabled={isPending}
                  className="md:w-1/2 w-full"
                  checkIconPosition="right"
                />
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
                description="Environment this strategy is applied to"
              >
                <Grid columns={12} mt="md">
                  {environmentOptions?.map((item) => (
                    <Grid.Col
                      span={{ base: 12, md: 12, lg: 4 }}
                      key={item.value}
                    >
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
                  className="md:w-1/2 w-full"
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
                    className="md:w-1/2 w-full mt-4"
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
                    color="rollout.6"
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
                    <Grid columns={12}>
                      <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
                        <DateTimePickerField
                          name="startsAt"
                          label="Starts at"
                          className="flex-1"
                          leftSection={<IconCalendar size={16} />}
                          clearable
                          disabled={isPending}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
                        <DateTimePickerField
                          name="endsAt"
                          label="Ends at"
                          className="flex-1"
                          leftSection={<IconCalendar size={16} />}
                          clearable
                          disabled={isPending}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
                        <SelectField
                          name="timezone"
                          options={timezoneOptions}
                          label="Timezone"
                          placeholder="Select timezone"
                          isSearchable
                          disabled={isPending}
                          checkIconPosition="right"
                          clearable
                          nothingFoundMessage="Not found"
                        />
                      </Grid.Col>
                    </Grid>
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

                                <Grid columns={12}>
                                  <Grid.Col
                                    span={{ base: 12, md: 12, lg: 6 }}
                                    ta="left"
                                  >
                                    <SelectCreatableField
                                      name={`rules.${index}.field`}
                                      label="Field"
                                      placeholder="e.g., email, country, plan"
                                      disabled={isPending}
                                      required
                                      options={predefinedRuleFieldOptions}
                                    />
                                  </Grid.Col>
                                  <Grid.Col
                                    span={{ base: 12, md: 12, lg: 6 }}
                                    ta="left"
                                  >
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
                                  </Grid.Col>
                                </Grid>

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
                            } as EditStrategyRuleFormState)
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
                strategyId={strategyId}
                featureFlagId={featureFlagId}
                projectId={projectId}
                disabled={isPending}
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
                <Button
                  type="submit"
                  variant="light"
                  disabled={isPending || !dirty}
                >
                  {isPending ? <Loader size="xs" color="white" /> : 'Save'}
                </Button>
              </div>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};
