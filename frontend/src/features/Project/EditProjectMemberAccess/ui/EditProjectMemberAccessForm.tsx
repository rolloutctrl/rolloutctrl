import { Form, Formik } from 'formik';
import { useEditProjectMemberAccessForm } from '../lib/useEditProjectMemberAccessForm';
import type { ProjectMember } from '@/entities/Project';
import { Button, Group, Loader, Radio, Stack, Text } from '@mantine/core';
import { roleDescriptions } from '@/shared/constants/consts';
import type { Nullable } from '@/shared/types/types';

type EditProjectMemberAccessFormProps = {
  projectMember: Nullable<ProjectMember>;
  currentUserId?: string;
};

export const EditProjectMemberAccessForm = ({
  projectMember,
  currentUserId
}: EditProjectMemberAccessFormProps) => {
  const { initialValues, isPending, submitForm, isDisabled, teamRoleOptions } =
    useEditProjectMemberAccessForm(projectMember, currentUserId);
  return (
    <Formik initialValues={initialValues} onSubmit={submitForm} enableReinitialize>
      {({ dirty, values, setFieldValue }) => (
        <Form className='flex flex-col w-full gap-4'>
          <Radio.Group
            name="role"
            label="Team role"
            value={values?.role}
            onChange={(value) => setFieldValue('role', value)}
            disabled={isDisabled || isPending}
            classNames={{
              root: 'w-full'
            }}
          >
            <Stack pt="xs" gap="xs">
              {teamRoleOptions.map((role) => (
                <Radio.Card
                  key={role.value}
                  value={role.value}
                  disabled={isPending || isDisabled}
                  className="!p-4 w-full"
                >
                  <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />
                    <div>
                      <Text size="sm" fw={500}>
                        {role.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {
                          roleDescriptions[
                            role.value as keyof typeof roleDescriptions
                          ]
                        }
                      </Text>
                    </div>
                  </Group>
                </Radio.Card>
              ))}
            </Stack>
          </Radio.Group>
          <div className="flex flex-row w-full items-center justify-start gap-x-2">
            <Button
              type="submit"
              variant="light"
              disabled={isDisabled || isPending || !dirty}
            >
              {isPending ? <Loader size="xs" color="white" /> : 'Save Changes'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
