import { Form, Formik } from 'formik';
import { Button, Loader, Stack } from '@mantine/core';
import { SwitchField, TextAreaField, TextField } from '@/shared/ui';
import { useEditFeatureFlagForm } from '../lib/useEditFeatureFlagForm';
import { editFeatureFlagFormSchema } from '../lib/consts';

type EditFeatureFlagFormProps = {
  flagKey: string;
  onClose: () => void;
};

export const EditFeatureFlagForm = ({ flagKey, onClose }: EditFeatureFlagFormProps) => {
  const { initialValues, submitForm, isPending } =
    useEditFeatureFlagForm(flagKey, onClose);
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={editFeatureFlagFormSchema}
      enableReinitialize
    >
      <Form>
        <Stack gap="md">
          <TextField
            name="key"
            label="Key"
            description="Unique identifier for the feature flag, eg: experimental-feature"
            required
            disabled={isPending}
          />
          <TextAreaField
            name="description"
            label="Description (Optional)"
            disabled={isPending}
          />
          <SwitchField name="archived" label="Archived" disabled={isPending} />
          <div className="flex flex-row w-full items-center justify-end gap-x-2">
            <Button
              type="button"
              variant="light"
              color="gray"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="light" disabled={isPending}>
              {isPending ? <Loader size="xs" color="white" /> : 'Save Changes'}
            </Button>
          </div>
        </Stack>
      </Form>
    </Formik>
  );
};
