import { useGetActionById } from '@/entities/Action';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { DeleteActionDialog } from '@/features/Action/DeleteAction';
import { EditActionModal } from '@/features/Action/EditAction';
import { PermissionCode } from '@/shared/types/enums';
import { BackButton } from '@/shared/ui';
import { ActionStrategyAccordion } from '@/widgets/Action/ActionStrategyAccordion';
import {
  ActionIcon as MantineActionButton,
  Badge,
  Grid,
  Group,
  Menu,
  Text,
  Title,
  useMantineColorScheme,
  Paper,
} from '@mantine/core';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export const ActionView = () => {
  const { actionId, projectId } = useParams();
  const { colorScheme } = useMantineColorScheme();

  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const { data: action } = useGetActionById(actionId ?? '', projectId ?? '');

  const handleCloseModal = () =>
    setModalState({ openEditModal: false, openDeleteDialog: false });

  const handleOpenEdit = () =>
    setModalState((s) => ({ ...s, openEditModal: true }));

  const handleOpenDelete = () =>
    setModalState((s) => ({ ...s, openDeleteDialog: true }));

  return (
    <Grid columns={24}>
      <Grid.Col span={24} ta="left">
        <BackButton
          label="Back to Actions"
          to={`/project/${projectId}/actions`}
        />
        <Paper p={0} radius="md" withBorder>
          <div className="flex flex-row items-start justify-between p-4">
            <div className="flex flex-col items-start gap-1">
              <Group gap="sm">
                <Title
                  order={2}
                  fw={700}
                  size="xl"
                  ta="left"
                  className="space-grotesk-bold"
                >
                  {action?.key}
                </Title>
                <Badge
                  variant="outline"
                  color={action?.enabled ? 'rollout' : 'gray'}
                >
                  {action?.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {action?.defaultEffect && (
                  <Badge variant="light" color="indigo">
                    Default: {action.defaultEffect}
                  </Badge>
                )}
              </Group>
              <Text size="sm" ta="left" c="dimmed">
                {action?.description?.length
                  ? action.description
                  : 'No description'}
              </Text>
            </div>

            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.ACTION_UPDATE}
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
                    permissions={PermissionCode.ACTION_DELETE}
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
        </Paper>
      </Grid.Col>

      <Grid.Col span={24}>
        {action && <ActionStrategyAccordion action={action} />}
      </Grid.Col>

      {action && (
        <>
          <EditActionModal
            selectedAction={action}
            opened={modalState.openEditModal}
            onClose={handleCloseModal}
          />
          <DeleteActionDialog
            action={action}
            opened={modalState.openDeleteDialog}
            onClose={handleCloseModal}
            needRedirect
          />
        </>
      )}
    </Grid>
  );
};
