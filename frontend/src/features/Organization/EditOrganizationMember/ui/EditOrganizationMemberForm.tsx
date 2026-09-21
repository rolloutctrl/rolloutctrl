import { FieldArray, Form, Formik } from 'formik';
import { useEditOrganizationMemberForm } from '../lib/useEditOrganizationMemberForm';
import {
  ActionIcon,
  Button,
  Paper,
  Divider,
  Group,
  Loader,
  Radio,
  Select,
  Stack,
  Text,
  Grid,
} from '@mantine/core';
import { roleDescriptions } from '@/shared/constants/consts';
import { PasswordField, TextField } from '@/shared/ui';
import { SelectField } from '@/shared/ui/FormikFields/SelectField';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { TeamRole } from '@/shared/types/enums';
import type { AssignMemberToProjectState } from '../../AddOrganizationMember/model/types';
import type { User } from '@/entities/User';

type EditOrganizationMemberFormProps = {
  member?: User | null;
  onClose: () => void;
};

export const EditOrganizationMemberForm = ({
  member,
  onClose,
}: EditOrganizationMemberFormProps) => {
  const {
    initialValues,
    isPending,
    allProjectOptions,
    teamRoleOptions,
    isLoadingProjects,
    organizationRolesOptions,
    getAvailableProjectOptions,
    submitForm,
  } = useEditOrganizationMemberForm(member, onClose);

  return (
    <Formik initialValues={initialValues} onSubmit={submitForm}>
      {({ values, setFieldValue }) => (
        <Form>
          <Stack gap="md">
            <TextField
              name="name"
              label="Name"
              placeholder="John Doe"
              required
              disabled={isPending}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="johndoe@gmail.com"
              required
              disabled={isPending}
            />

            <Grid columns={12}>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <PasswordField
                  name="password"
                  label="Password (Optional)"
                  description="Leave empty to keep current"
                  disabled={isPending}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <PasswordField
                  name="confirmPassword"
                  label="Confirm password (Optional)"
                  description="Leave empty to keep current"
                  disabled={isPending}
                />
              </Grid.Col>
            </Grid>
            
            <SelectField
              name="role"
              label="Organization role"
              required
              options={organizationRolesOptions}
              checkIconPosition="right"
            />

            <Divider label="Project assignments" labelPosition="center" />

            <FieldArray name="projects">
              {({ push, remove }) => (
                <Stack gap="sm">
                  {values.projects.length > 0 ? (
                    values.projects.map((assignment, index) => {
                      const selectedIds = values.projects.map(
                        (p) => p.projectId,
                      );
                      const availableOptions = getAvailableProjectOptions(
                        selectedIds,
                        index,
                      );

                      return (
                        <Paper key={index} p="sm" withBorder radius="md">
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" fw={500}>
                                Project {index + 1}
                              </Text>
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => remove(index)}
                                disabled={isPending}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>

                            <Select
                              label="Project"
                              data={availableOptions}
                              value={assignment.projectId || null}
                              onChange={(value) =>
                                setFieldValue(
                                  `projects.${index}.projectId`,
                                  value ?? '',
                                )
                              }
                              loading={isLoadingProjects}
                              disabled={
                                isPending || allProjectOptions.length === 0
                              }
                              checkIconPosition="right"
                              placeholder="Select project"
                              required
                              withAsterisk
                            />

                            <Radio.Group
                              label="Team role"
                              value={assignment.teamRole}
                              onChange={(value) =>
                                setFieldValue(
                                  `projects.${index}.teamRole`,
                                  value,
                                )
                              }
                            >
                              <Stack pt="xs" gap="xs">
                                {teamRoleOptions.map((role) => (
                                  <Radio.Card
                                    key={role.value}
                                    value={role.value}
                                    disabled={isPending}
                                    className="!p-4"
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
                          </Stack>
                        </Paper>
                      );
                    })
                  ) : (
                    <Text size="sm" c="dimmed" ta="center">
                      No project assignments added
                    </Text>
                  )}

                  <Button
                    variant="outline"
                    leftSection={<IconPlus size={16} />}
                    onClick={() =>
                      push({
                        projectId: '',
                        teamRole: TeamRole.DEVELOPER,
                      } as AssignMemberToProjectState)
                    }
                    disabled={
                      isPending ||
                      values.projects.length >= allProjectOptions.length
                    }
                  >
                    Add Project
                  </Button>
                </Stack>
              )}
            </FieldArray>

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
                {isPending ? (
                  <Loader size="xs" color="white" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
