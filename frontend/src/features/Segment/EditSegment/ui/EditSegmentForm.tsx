import { Form, Formik, FieldArray } from 'formik';
import { useEditSegmentForm } from '../lib/useEditSegmentForm';
import {
  Button,
  Loader,
  Stack,
  Select,
  Paper,
  Group,
  Text,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  SelectCreatableField,
  SwitchField,
  TagsInputField,
  TextAreaField,
  TextField,
} from '@/shared/ui';
import { Operator } from '@/shared/types/enums';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { editSegmentFormSchema } from '../lib/consts';
import { predefinedRuleFieldOptions } from '@/shared/constants/consts';

type EditSegmentFormProps = {
  segmentId: string;
  onClose: () => void;
};

const operatorOptions = Object.values(Operator).map((op) => ({
  value: op,
  label: op,
}));

const ARRAY_OPERATORS: Operator[] = [Operator.IN, Operator.INCLUDES];
const isArrayOperator = (op: Operator) => ARRAY_OPERATORS.includes(op);

export const EditSegmentForm = ({
  segmentId,
  onClose,
}: EditSegmentFormProps) => {
  const { initialValues, isPending, newSegmentRule, submitForm } =
    useEditSegmentForm(segmentId, onClose);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      enableReinitialize
      validationSchema={editSegmentFormSchema}
    >
      {({ values, setFieldValue, dirty }) => (
        <Form>
          <Stack gap="md">
            <TextField
              name="name"
              label="Segment Name"
              required
              disabled={isPending}
            />

            <TextField
              name="key"
              label="Segment Key"
              required
              disabled={isPending}
            />

            <TextAreaField
              name="description"
              label="Description"
              description="Optional description for this segment"
              disabled={isPending}
            />

            <Divider label="Segment Rules" labelPosition="center" />

            <FieldArray name="rules">
              {({ push, remove }) => (
                <Stack gap="sm">
                  {values.rules && values.rules.length > 0 ? (
                    values.rules.map((rule, index) => (
                      <Paper key={index} p="sm" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
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
                                  setFieldValue(`rules.${index}.operator`, op);
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
                    onClick={() => push(newSegmentRule)}
                    disabled={isPending}
                  >
                    Add Rule
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
              <Button
                type="submit"
                variant="light"
                disabled={isPending || !dirty}
              >
                {isPending ? (
                  <Loader size="xs" color="white" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
