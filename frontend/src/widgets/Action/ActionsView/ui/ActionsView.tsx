import { Paper, Grid, Title } from '@mantine/core';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { ActionsTable } from '../../ActionsTable';
import { CreateActionButton } from '@/features/Action/CreateAction';

export const ActionsView = () => {
  return (
    <Grid columns={24}>
      <Grid.Col span={24}>
        <Paper radius="md" p={0} className="!overflow-clip" withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={2} fw={700} size="xl" ta="left">
              Actions
            </Title>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.ACTION_CREATE}
            >
              <CreateActionButton />
            </RequiredProjectPermissionsWrapper>
          </div>
          <ActionsTable />
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
