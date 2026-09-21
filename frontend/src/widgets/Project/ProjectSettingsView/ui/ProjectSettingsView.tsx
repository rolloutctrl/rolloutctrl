import { Paper, Divider, Grid, Text, Title } from '@mantine/core';
import { EditProjectForm } from '@/features/Project/EditProject';
import { ProjectManageMembersContainer } from './ProjectManageMembersContainer';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { DeleteProjectButton } from '@/features/Project/DeleteProject';

export const ProjectSettingsView = () => {
  return (
    <Grid columns={24}>
      <Grid.Col span={24}>
        <Paper radius="md" p={0} className="!overflow-clip" withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={2} fw={700} size="xl" ta="left">
              Project Settings
            </Title>
          </div>
          <Grid columns={12} p="md">
            <Grid.Col span={{ base: 12, md: 12, lg: 4 }} ta="left">
              <Title order={3} fw={600} size="lg" ta="left" pb={4}>
                General
              </Title>
              <Text size="sm" c="dimmed">
                Project name and description
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
              <EditProjectForm />
            </Grid.Col>
          </Grid>
          <RequiredProjectPermissionsWrapper
            permissions={PermissionCode.PROJECT_MEMBERS_MANAGE}
          >
            <Divider my="md" />
            <Grid columns={12} p="md">
              <Grid.Col span={{ base: 12, md: 12, lg: 4 }} ta="left">
                <Title order={3} fw={600} size="lg" ta="left" pb={4}>
                  Access management
                </Title>
                <Text size="sm" c="dimmed" className="max-w-[16.5rem]">
                  Invite, remove, or change roles for team members working on
                  this project
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <ProjectManageMembersContainer />
              </Grid.Col>
            </Grid>
          </RequiredProjectPermissionsWrapper>
          <RequiredProjectPermissionsWrapper
            permissions={PermissionCode.PROJECT_DELETE}
          >
            <Divider my="md" />
            <Grid columns={12} p="md">
              <Grid.Col span={{ base: 12, md: 12, lg: 4 }} ta="left">
                <Title order={3} fw={600} size="lg" ta="left" c="red" pb={4}>
                  Danger Zone
                </Title>
                <Text size="sm" c="dimmed" className="max-w-[16.5rem]">
                  This actions cannot be undone.
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <DeleteProjectButton />
              </Grid.Col>
            </Grid>
          </RequiredProjectPermissionsWrapper>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
