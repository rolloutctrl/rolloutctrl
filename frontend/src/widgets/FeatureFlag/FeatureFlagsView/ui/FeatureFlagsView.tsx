import { CreateFeatureFlagButton } from '@/features/FeatureFlag/CreateFeatureFlag';
import { Grid, Group, Paper, Tabs, Title } from '@mantine/core';
import { ActiveFeatureFlagsTab, ArchivedFeatureFlagsTab } from './tabs';
import { useFeatureFlagsTabs } from '../lib/FeatureFlagsProvider';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

export const FeatureFlagsView = () => {
  const { activeTab, setActiveTab } = useFeatureFlagsTabs();
  return (
    <Tabs
      defaultValue="active"
      value={activeTab}
      onChange={(value) => value && setActiveTab(value)}
    >
      <Grid columns={24}>
        <Grid.Col span={24}>
          <Paper radius="md" p={0} className="!overflow-clip" withBorder>
            <Group gap="xs" justify='space-between' p="md">
              <Title order={2} fw={700} size="xl" ta="left">
                Feature Flags
              </Title>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.FLAG_CREATE}
              >
                <CreateFeatureFlagButton />
              </RequiredProjectPermissionsWrapper>
            </Group>
            <Tabs.List justify="left">
              <Tabs.Tab value="active">Active</Tabs.Tab>
              <Tabs.Tab value="archive">Archive</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="active">
              <ActiveFeatureFlagsTab />
            </Tabs.Panel>
            <Tabs.Panel value="archive">
              <ArchivedFeatureFlagsTab
                includeArchived={activeTab === 'archive'}
              />
            </Tabs.Panel>
          </Paper>
        </Grid.Col>
      </Grid>
    </Tabs>
  );
};
