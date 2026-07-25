import { Form, Formik } from 'formik';
import { useEditOrganizationForm } from '../lib/useEditOrganizationForm';
import { Button, Loader, Stack } from '@mantine/core';
import { TextAreaField, TextField } from '@/shared/ui';

export const EditOrganizationForm = () => {
  const { initialValues, isLoading, submitForm } = useEditOrganizationForm();
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      enableReinitialize
    >
      {({ dirty }) => (
        <Form>
          <Stack gap="md">
            <TextField
              name="name"
              label="Organization name"
              disabled={isLoading}
              required
            />
            <TextField name="url" label="URL (Optional)" disabled={isLoading} />
            <TextAreaField
              name="description"
              label="Description (Optional)"
              disabled={isLoading}
            />
            <div className="flex flex-row w-full items-center justify-start gap-x-2">
              <Button
                type="submit"
                variant="light"
                disabled={isLoading || !dirty}
              >
                {isLoading ? (
                  <Loader size="xs" color="white" />
                ) : (
                  'Update organization'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
