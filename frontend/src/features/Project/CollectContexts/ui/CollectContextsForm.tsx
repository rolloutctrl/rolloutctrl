import { Form, Formik } from 'formik';
import { useCollectContextsForm } from '../lib/useCollectContextsForm';
import { Button, Stack } from '@mantine/core';
import { SwitchField, TagsInputField } from '@/shared/ui';
import { collectContextsFormSchema } from '../lib/consts';

export const CollectContextsForm = () => {
  const { initialValues, submitForm, isLoading } = useCollectContextsForm();
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={collectContextsFormSchema}
    >
      {({ values, dirty }) => (
        <Form>
          <Stack gap="md">
            <SwitchField
              name="isEnabled"
              label="Enable context collection"
              disabled={isLoading}
            />
            <Stack gap="md">
              <TagsInputField
                name="allowedAttributes"
                label="Allowed contexts"
                description="Enter context attributes names"
                placeholder="userId, plan, country..."
                disabled={isLoading || !values.isEnabled}
                clearable
                maxTags={20}
              />
            </Stack>
            <div className="flex flex-row items-center gap-x-2">
              <Button
                type="submit"
                variant="light"
                disabled={!dirty || isLoading}
              >
                Update Settings
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
