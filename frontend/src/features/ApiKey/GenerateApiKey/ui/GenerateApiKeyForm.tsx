import { Field, Form, Formik, type FieldProps } from 'formik';
import { useGenerateApiKeyForm } from '../lib/useGenerateApiKeyForm';
import {
  ActionIcon,
  Alert,
  Button,
  CopyButton,
  Group,
  Loader,
  Radio,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { TagsInputField, TextField } from '@/shared/ui';
import { ApiKeyType } from '@/shared/types/enums';
import { SelectField } from '@/shared/ui/FormikFields/SelectField';
import { IconCheck, IconCopy } from '@tabler/icons-react';

type GenerateApiKeyFormProps = {
  onClose: () => void;
};

export const GenerateApiKeyForm = ({ onClose }: GenerateApiKeyFormProps) => {
  const { initialValues, isLoading, rawKey, environmentOptions, submitForm } =
    useGenerateApiKeyForm();

  if (rawKey) {
    return (
      <Stack gap="md">
        <Text fw={500} size="sm" ta="left">
          Copy this key and store it securely. You won't be able to see it
          again.
        </Text>
        <Alert
          className="flex flex-row w-full p-4 break-all gap-2"
          fw={500}
          ta="left"
          variant="light"
        >
          {rawKey}
          <CopyButton value={rawKey} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? 'Copied' : 'Copy'}
                withArrow
                position="right"
              >
                <ActionIcon
                  color={copied ? 'rollout' : 'gray'}
                  variant="subtle"
                  onClick={copy}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Alert>
        <div className="flex flex-row w-full items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="light"
            color="gray"
            disabled={isLoading}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Formik initialValues={initialValues} onSubmit={submitForm}>
      {({ values }) => (
        <Form>
          <Stack gap="md">
            <Field name="type">
              {({ field, form: { setFieldValue } }: FieldProps) => (
                <Radio.Group
                  {...field}
                  onChange={(value) => setFieldValue('type', value)}
                  label="Select API key type"
                  description="Choose whether this key will be used for client or server integration"
                  withAsterisk
                  disabled={isLoading}
                >
                  <Group mt="xs">
                    <Radio value={ApiKeyType.CLIENT} label="Client" />
                    <Radio value={ApiKeyType.SERVER} label="Server" />
                  </Group>
                </Radio.Group>
              )}
            </Field>

            <TextField
              name="name"
              label="Name"
              placeholder="Production API Key"
              disabled={isLoading}
              required
            />

            <SelectField
              name="environmentId"
              label="Environment"
              placeholder="Select target environment"
              options={environmentOptions}
              disabled={isLoading}
              required
              checkIconPosition="right"
            />
            {values.type === ApiKeyType.CLIENT && (
              <TagsInputField
                name="allowedOrigins"
                label="Allowed origins"
                description="Enter allowed origins separated by commas"
                placeholder="https://example.com, https://*.example.com, http://localhost:3000"
                required
                maxTags={12}
              />
            )}
            <div className="flex flex-row w-full items-center justify-end gap-x-2">
              <Button
                type="button"
                variant="light"
                color="gray"
                disabled={isLoading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" variant="light" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="xs" color="white" />
                ) : (
                  'Generate API Key'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
