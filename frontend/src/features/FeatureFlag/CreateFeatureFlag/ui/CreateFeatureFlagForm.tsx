import { Form, Formik, useFormikContext } from 'formik';
import { useCreateFeatureFlagForm } from '../lib/useCreateFeatureFlagForm';
import {
  Button,
  Loader,
  SegmentedControl,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import { JsonInputField, TextAreaField, TextField } from '@/shared/ui';
import { createFeatureFlagFormSchema } from '../lib/consts';
import type { CreateFeatureFlagFormState } from '../model/types';

type CreateFeatureFlagFormProps = {
  onClose: () => void;
};

const FormContent = ({
  isPending,
  onClose,
}: {
  isPending: boolean;
  onClose: () => void;
}) => {
  const { values, setFieldValue } =
    useFormikContext<CreateFeatureFlagFormState>();

  const { colorScheme } = useMantineColorScheme();

  return (
    <Form>
      <Stack gap="md">
        <SegmentedControl
          // color="rollout"
          value={values.type}
          onChange={(value) => setFieldValue('type', value)}
          data={[
            { label: 'Single flag', value: 'single' },
            { label: 'Multiple flags', value: 'multiple' },
          ]}
          classNames={{
            root: 'dark:!bg-dark-surface/30',
          }}
        />
        {values.type === 'single' && (
          <>
            <TextField
              name="key"
              label="Key"
              placeholder="experimental-feature"
              description="Unique identifier for the feature flag, eg: experimental-feature"
              required
              disabled={isPending}
            />
            <TextAreaField
              name="description"
              label="Description (Optional)"
              disabled={isPending}
            />
          </>
        )}
        {values.type === 'multiple' && (
          <>
            <JsonInputField
              name="flags"
              label="Flags"
              description="JSON object with feature flags"
              placeholder={`[{"key": "dark-mode", "description": "Enable dark theme UI across the entire application"}, ...]`}
              required
              disabled={isPending}
              minRows={10}
            />
          </>
        )}
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant={colorScheme === 'light' ? 'light' : 'subtle'}
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
  );
};

export const CreateFeatureFlagForm = ({
  onClose,
}: CreateFeatureFlagFormProps) => {
  const { initialValues, isPending, submitForm } =
    useCreateFeatureFlagForm(onClose);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={createFeatureFlagFormSchema}
    >
      <FormContent isPending={isPending} onClose={onClose} />
    </Formik>
  );
};
