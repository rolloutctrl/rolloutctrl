import { ProjectDetailsCard } from '@/entities/Project';
import { Grid, Tabs } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { FeatureFlagsTab, SegmentsTab } from './tabs';

export const ProjectView = () => {
  const navigate = useNavigate();
  const { projectId, projectTab } = useParams();
  return (
    <Tabs
      value={projectTab}
      defaultValue="feature-flags"
      onChange={(value) => navigate(`/project/${projectId}/${value}`)}
    >
      <Grid columns={24}>
        <Grid.Col span={24}>
          <ProjectDetailsCard
            tabList={
              <Tabs.List grow justify="center">
                <Tabs.Tab value="feature-flags">Feature Flags</Tabs.Tab>
                <Tabs.Tab value="actions">Actions</Tabs.Tab>
                <Tabs.Tab value="segments">Segments</Tabs.Tab>
                <Tabs.Tab value="env">Environments</Tabs.Tab>
                <Tabs.Tab value="settings">Project Settings</Tabs.Tab>
                <Tabs.Tab value="logs">Event Logs</Tabs.Tab>
              </Tabs.List>
            }
          />
        </Grid.Col>
        <Grid.Col span={24}>
          <Tabs.Panel value="feature-flags">
            <FeatureFlagsTab />
          </Tabs.Panel>
          <Tabs.Panel value="segments">
            <SegmentsTab />
          </Tabs.Panel>
        </Grid.Col>
      </Grid>
    </Tabs>
  );
};
