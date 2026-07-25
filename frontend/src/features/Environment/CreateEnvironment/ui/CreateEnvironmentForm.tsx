import { Form, Formik } from 'formik';
import { useCreateEnvironmentForm } from '../lib/useCreateEnvironmentForm';
import { Button, Loader, Stack } from '@mantine/core';
import { TextField } from '@/shared/ui';
import { createEnvironmentFormSchema } from '../lib/consts';

type CreateEnvironmentFormProps = {
  onClose: () => void;
};

export const CreateEnvironmentForm = ({
  onClose,
}: CreateEnvironmentFormProps) => {
  const { initialValues, submitForm, isPending } =
    useCreateEnvironmentForm(onClose);
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={createEnvironmentFormSchema}
    >
      <Form>
        <Stack gap="md">
          <TextField
            name="name"
            label="Name"
            placeholder="Staging"
            required
            disabled={isPending}
          />
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
              {isPending ? <Loader size="xs" color="white" /> : 'Create'}
            </Button>
          </div>
        </Stack>
      </Form>
    </Formik>
  );
};
