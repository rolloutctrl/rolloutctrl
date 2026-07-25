import { Form, Formik } from 'formik';
import { useEditUserForm } from '../lib/useEditUserForm';
import { Button, Loader, Stack } from '@mantine/core';
import { TextAreaField, TextField } from '@/shared/ui';

export const EditUserForm = () => {
  const { initialValues, isLoading, submitForm } = useEditUserForm();
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      enableReinitialize
    >
      {({ dirty }) => (
        <Form>
          <Stack gap="md">
            <TextField name="name" label="Name" disabled={isLoading} required />
            <TextField
              type="email"
              name="email"
              label="Email"
              required
              disabled
            />
            <TextAreaField
              name="bio"
              label="Bio (Optional)"
              disabled={isLoading}
              placeholder="Tell us a little bit about yourself"
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
                  'Update profile'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
