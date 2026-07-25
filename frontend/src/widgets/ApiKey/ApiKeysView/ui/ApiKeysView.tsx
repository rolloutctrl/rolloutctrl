import { Paper, Grid, Title } from '@mantine/core';

import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { GenerateApiKeyButton } from '@/features/ApiKey/GenerateApiKey';
import { ApiKeysTable } from '../../ApiKeysTable';

export const ApiKeysView = () => {
  return (
    <Grid columns={12}>
      <Grid.Col span={12}>
        <Paper radius="md" p={0} className="!overflow-clip" withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={1} fw={700} size="xl" ta="left">
              API Keys
            </Title>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.API_KEY_CREATE}
            >
              <GenerateApiKeyButton />
            </RequiredProjectPermissionsWrapper>
          </div>
          <Grid.Col span={12}>
            <ApiKeysTable />
          </Grid.Col>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
