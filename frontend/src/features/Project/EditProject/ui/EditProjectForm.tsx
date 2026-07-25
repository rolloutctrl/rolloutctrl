import { Form, Formik } from 'formik';
import { Button, Loader, Stack } from '@mantine/core';
import { TextAreaField, TextField } from '@/shared/ui';
import { useEditProjectForm } from '../lib/useEditProjectForm';
import { editProjectFormSchema } from '../lib/consts';

type EditProjectFormProps = {
  onClose?: () => void;
};

export const EditProjectForm = ({ onClose }: EditProjectFormProps) => {
  const { initialValues, submitForm, isPending } = useEditProjectForm(onClose);
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={editProjectFormSchema}
      enableReinitialize
    >
      {({ dirty }) => (
        <Form>
          <Stack gap="md">
            <TextField
              name="name"
              label="Name"
              placeholder="My best project"
              required
              disabled={isPending}
            />
            <TextField
              name="slug"
              label="Slug"
              placeholder="my-best-project"
              required
              disabled={isPending}
            />
            <TextAreaField
              name="description"
              label="Description"
              disabled={isPending}
            />
            <div className="flex flex-row w-full items-center justify-start gap-x-2">
              <Button type="submit" variant="light" disabled={isPending || !dirty}>
                {isPending ? <Loader size="xs" color="white" /> : 'Save Changes'}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
