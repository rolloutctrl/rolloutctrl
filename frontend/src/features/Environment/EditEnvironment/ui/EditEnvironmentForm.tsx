import { Form, Formik } from 'formik';
import { useEditEnvironmentForm } from '../lib/useEditEnvironmentForm';
import { Button, Loader, Stack } from '@mantine/core';
import { TextField } from '@/shared/ui';
import { editEnvironmentFormSchema } from '../lib/consts';

type EditEnvironmentFormProps = {
  environmentId: string;
  onClose: () => void;
};

export const EditEnvironmentForm = ({
  environmentId,
  onClose,
}: EditEnvironmentFormProps) => {
  const { initialValues, submitForm, isPending } = useEditEnvironmentForm(
    environmentId,
    onClose,
  );
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={editEnvironmentFormSchema}
      enableReinitialize
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
              {isPending ? <Loader size="xs" color="white" /> : 'Save Changes'}
            </Button>
          </div>
        </Stack>
      </Form>
    </Formik>
  );
};
