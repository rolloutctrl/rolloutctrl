import {
  EnvironmentCard,
  useGetEnvironmentsByProjectId,
} from '@/entities/Environment';
import type { EnvironmentWithCounts } from '@/entities/Environment/model/types';
import { DeleteEnvironmentDialog } from '@/features/Environment/DeleteEnvironment';
import { EditEnvironmentModal } from '@/features/Environment/EditEnvironment';
import type { Nullable } from '@/shared/types/types';
import {
  ActionIcon as MantineActionButton,
  Center,
  Grid,
  Loader,
  Menu,
  Text,
} from '@mantine/core';
import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export const EnvironmentsContainer = () => {
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Nullable<EnvironmentWithCounts>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });
  const { projectId } = useParams();

  const {
    data: environments,
    isLoading,
    isError,
  } = useGetEnvironmentsByProjectId(projectId);

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedEnvironment(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (env: EnvironmentWithCounts) => {
    setSelectedEnvironment(env);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (env: EnvironmentWithCounts) => {
    setSelectedEnvironment(env);
    handleOpenModal(true, 'openDeleteDialog');
  };

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center p="xl">
        <Text c="red">Failed to load feature flags</Text>
      </Center>
    );
  }
  return (
    <Grid columns={12} px="md" pb="md">
      {environments?.map((environment) => (
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={environment.id}>
          <EnvironmentCard
            environment={environment}
            menuSlot={
              !environment?.isSystem && (
                <Menu shadow="none" width={120} position="bottom-end">
                  <Menu.Target>
                    <MantineActionButton
                      variant="light"
                      size="md"
                      color="gray"
                      aria-label="Environment actions"
                      disabled={environment?.isSystem}
                    >
                      <IconDotsVertical size={14} />
                    </MantineActionButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={14}  />}
                      onClick={() => handleOpenEdit(environment)}
                      disabled={environment?.isSystem}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14}  />}
                      onClick={() => handleOpenDelete(environment)}
                      disabled={environment?.isSystem}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )
            }
          />
        </Grid.Col>
      ))}
      <DeleteEnvironmentDialog
        environment={selectedEnvironment}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      />
      <EditEnvironmentModal
        environment={selectedEnvironment}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
    </Grid>
  );
};
