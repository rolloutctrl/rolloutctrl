import { Form, Formik } from 'formik';
import { Button, Loader, Stack } from '@mantine/core';
import { TextAreaField, TextField } from '@/shared/ui';
import { useCreateProjectForm } from '../lib/useCreateProjectForm';
import { createProjectFormSchema } from '../lib/consts';

type CreateProjectFormProps = {
  onClose: () => void;
};

export const CreateProjectForm = ({ onClose }: CreateProjectFormProps) => {
  const { initialValues, submitForm, isPending } =
    useCreateProjectForm(onClose);
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={createProjectFormSchema}
    >
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
