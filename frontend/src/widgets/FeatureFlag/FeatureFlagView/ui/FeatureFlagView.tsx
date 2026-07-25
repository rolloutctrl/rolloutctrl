import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { DeleteFeatureFlagDialog } from '@/features/FeatureFlag/DeleteFeatureFlag';
import { EditFeatureFlagModal } from '@/features/FeatureFlag/EditFeatureFlag';
import { PermissionCode } from '@/shared/types/enums';
import { BackButton } from '@/shared/ui';
import { StrategyAccordion } from '@/widgets/Strategy/StrategyAccordion';
import {
  ActionIcon as MantineActionButton,
  Paper,
  Grid,
  Menu,
  Text,
  Group,
  Badge,
  Title,
  useMantineColorScheme,
  Tabs,
} from '@mantine/core';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FeatureFlagMetricsTab, FeatureFlagVariantsTab } from './tabs';

export const FeatureFlagView = () => {
  const navigate = useNavigate();
  const { projectId, featureFlagId, featureFlagTab } = useParams();

  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const { colorScheme } = useMantineColorScheme();

  const { data: featureFlag } = useGetFeatureFlagById(projectId, featureFlagId);

  const isActive = featureFlag?.environments.some((env) => env.enabled);

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () =>
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });

  const handleOpenEdit = () => handleOpenModal(true, 'openEditModal');

  const handleOpenDelete = () => handleOpenModal(true, 'openDeleteDialog');

  return (
    <Tabs defaultValue="overview" value={featureFlagTab} onChange={(value) => navigate(`/project/${projectId}/feature-flags/${featureFlagId}/${value}`)}>
      <Grid columns={24}>
        <Grid.Col span={24} ta="left">
          <BackButton
            label="Back to Feature Flags"
            to={`/project/${projectId}/feature-flags`}
          />
          <Paper p={0} radius="md" className="!overflow-clip" withBorder>
            <div className="flex flex-row items-start justify-between p-4">
              <div className="flex flex-col items-start gap-1">
                <Group gap="sm">
                  <Title fw={700} size="xl" ta="left">
                    {featureFlag?.key}
                  </Title>
                  {isActive && (
                    <Badge variant="outline" color="rollout">
                      Active
                    </Badge>
                  )}
                  {featureFlag?.archived && (
                    <Badge variant="outline" color="red">
                      Archived
                    </Badge>
                  )}
                </Group>

                <Text size="sm" ta="left">
                  {!featureFlag?.description?.length
                    ? 'No description'
                    : featureFlag.description}
                </Text>
              </div>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.FLAG_UPDATE}
              >
                <Menu shadow="none" width={120} position="bottom-end">
                  <Menu.Target>
                    <MantineActionButton
                      variant={colorScheme === 'light' ? 'light' : 'subtle'}
                      size="md"
                      color="gray"
                    >
                      <IconDotsVertical size={14} />
                    </MantineActionButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={14}  />}
                      onClick={handleOpenEdit}
                    >
                      Edit
                    </Menu.Item>
                    <RequiredProjectPermissionsWrapper
                      permissions={PermissionCode.FLAG_DELETE}
                    >
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14}  />}
                        onClick={handleOpenDelete}
                      >
                        Delete
                      </Menu.Item>
                    </RequiredProjectPermissionsWrapper>
                  </Menu.Dropdown>
                </Menu>
              </RequiredProjectPermissionsWrapper>
            </div>
            <Tabs.List justify="left">
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="variants">Variants</Tabs.Tab>
              <Tabs.Tab value="metrics">Metrics</Tabs.Tab>
            </Tabs.List>
          </Paper>
        </Grid.Col>
        <Grid.Col span={24}>
          <Tabs.Panel value="overview">
            {featureFlag && <StrategyAccordion featureFlag={featureFlag} />}
          </Tabs.Panel>
          <Tabs.Panel value="variants">
            {featureFlag && (
              <FeatureFlagVariantsTab featureFlag={featureFlag} />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="metrics">
            {featureFlag && (
              <FeatureFlagMetricsTab featureFlag={featureFlag} />
            )}
          </Tabs.Panel>
        </Grid.Col>
        <EditFeatureFlagModal
          featureFlag={featureFlag}
          opened={modalState.openEditModal}
          onClose={handleCloseModal}
        />
        <DeleteFeatureFlagDialog
          featureFlag={featureFlag}
          opened={modalState.openDeleteDialog}
          onClose={handleCloseModal}
          needRedirect
        />
      </Grid>
    </Tabs>
  );
};
