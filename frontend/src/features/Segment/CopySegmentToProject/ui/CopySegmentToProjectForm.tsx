import { Form, Formik } from 'formik';
import { useCopySegmentToProjectForm } from '../lib/useCopySegmentToProjectForm';
import { Button, Loader, Stack, Text } from '@mantine/core';
import { SelectField } from '@/shared/ui';
import { copySegmentToProjectFormSchema } from '../lib/consts';

type CopySegmentToProjectFormProps = {
  onClose: () => void;
  segmentName?: string;
  segmentId?: string;
};

export const CopySegmentToProjectForm = ({
  onClose,
  segmentName,
  segmentId,
}: CopySegmentToProjectFormProps) => {
  const { initialValues, submitForm, projectOptions, isLoading } =
    useCopySegmentToProjectForm(onClose, segmentId);
  return (
    <Formik initialValues={initialValues} onSubmit={submitForm} validationSchema={copySegmentToProjectFormSchema}>
      <Form>
        <Stack gap="md">
          <Text size="md" ta="left">
            Select project to copy segment{' '}
            {segmentName ? `"${segmentName}"` : ''} to:
          </Text>
          <SelectField
            name="projectId"
            label="Project"
            options={projectOptions}
            required
            disabled={isLoading}
            checkIconPosition='right'
          />
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
              {isLoading ? <Loader size="xs" color="white" /> : 'Copy'}
            </Button>
          </div>
        </Stack>
      </Form>
    </Formik>
  );
};
