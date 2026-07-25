import { Form, Formik } from 'formik';
import { useLoginForm } from '../lib/useLoginForm';
import { PasswordField, TextField } from '@/shared/ui';
import { Button, Loader } from '@mantine/core';

export const LoginForm = () => {
  const { initialValues, submitForm, isPending } = useLoginForm();
  return (
    <Formik initialValues={initialValues} onSubmit={submitForm}>
      <Form className="flex flex-col w-full gap-y-4">
        <TextField
          name="email"
          type="email"
          label="Email"
          disabled={isPending}
          placeholder="john.doe@example.com"
        />
        <PasswordField
          name="password"
          label="Password"
          disabled={isPending}
          placeholder="••••••••"
        />
        <Button type="submit" variant="light" size="md" disabled={isPending}>
          {isPending ? <Loader size="xs" color="white" /> : 'Login'}
        </Button>
      </Form>
    </Formik>
  );
};
