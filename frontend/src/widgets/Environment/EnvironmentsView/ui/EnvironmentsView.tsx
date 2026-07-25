import { Grid, Paper, Title } from '@mantine/core';
import { EnvironmentsContainer } from './EnvironmentsContainer';
import { CreateEnvironmentButton } from '@/features/Environment/CreateEnvironment';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

export const EnvironmentsView = () => {
  return (
    <Grid columns={12}>
      <Grid.Col span={12}>
        <Paper radius="md" p={0} className="!overflow-clip" withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={1} fw={700} size="xl" ta="left">
              Environments
            </Title>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.ENV_CREATE}
            >
              <CreateEnvironmentButton label="Add Environment" />
            </RequiredProjectPermissionsWrapper>
          </div>
          <Grid.Col span={12}>
            <EnvironmentsContainer />
          </Grid.Col>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
