import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { EditOrganizationForm } from '@/features/Organization/EditOrganization';
import { PermissionCode } from '@/shared/types/enums';
import { Box, Grid, Text, Title } from '@mantine/core';

export const OrganizationsTab = () => {
  return (
    <RequiredProjectPermissionsWrapper redirect permissions={PermissionCode.ORG_MANAGE}>
      <Box p={0} className="flex flex-col w-full">
        <Grid columns={12} p="md">
          <Grid.Col span={4} ta="left">
            <Title order={3} fw={600} size="lg" ta="left" pb={4}>
              General
            </Title>
            <Text size="sm" c="dimmed">
              Organization name, billing email and description
            </Text>
          </Grid.Col>
          <Grid.Col span={5} ta="left">
            <EditOrganizationForm />
          </Grid.Col>
        </Grid>
      </Box>
    </RequiredProjectPermissionsWrapper>
  );
};
