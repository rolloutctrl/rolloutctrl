import { Form, Formik } from 'formik';
import { useChangeUserPasswordForm } from '../lib/useChangeUserPasswordForm';
import { Button, Loader, Stack } from '@mantine/core';
import { PasswordField } from '@/shared/ui';

export const ChangeUserPasswordForm = () => {
  const { initialValues, isLoading, submitForm } = useChangeUserPasswordForm();

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      enableReinitialize
    >
      {({ dirty }) => (
        <Form>
          <Stack gap="md">
            <PasswordField
              name="password"
              label="New password"
              disabled={isLoading}
              placeholder="••••••••"
              required
            />
            <PasswordField
              name="confirmPassword"
              label="Confirm password"
              disabled={isLoading}
              placeholder="••••••••"
              required
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
                  'Update password'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
