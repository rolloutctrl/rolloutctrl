import { Table, Text, Center, Loader, useMantineColorScheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { Nullable } from '@/shared/types/types';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { useGetActionsByProjectId, type Action } from '@/entities/Action';
import { ActionTableItem } from './ActionTableItem';
import { EditActionModal } from '@/features/Action/EditAction';
import { DeleteActionDialog } from '@/features/Action/DeleteAction';

export const ActionsTable = () => {
  const { projectId } = useParams();
  const { colorScheme } = useMantineColorScheme();
  const [selectedAction, setSelectedAction] = useState<Nullable<Action>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetActionsByProjectId(projectId);

  const allActions = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= documentHeight - 200) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedAction(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (action: Action) => {
    setSelectedAction(action);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (action: Action) => {
    setSelectedAction(action);
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
        <Text c="red">Failed to load actions</Text>
      </Center>
    );
  }

  if (!allActions.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text c="dimmed" size="sm">
          No actions found
        </Text>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto lg:overflow-visible">
        <Table
          classNames={{
            td: '!px-4 whitespace-nowrap',
            th: '!px-4 whitespace-nowrap',
          }}
          className="min-w-[600px]"
        >
          <Table.Thead
            className='bg-gray-100 dark:bg-dark lg:sticky lg:top-[60px] lg:z-[100]'
          >
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Created</Table.Th>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.ACTION_UPDATE}
              >
                <Table.Th w={100}>Actions</Table.Th>
              </RequiredProjectPermissionsWrapper>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(allActions || [])?.map((action) => (
              <ActionTableItem
                key={action?.id}
                action={action}
                colorScheme={colorScheme}
                onEditAction={handleOpenEdit}
                onDeleteAction={handleOpenDelete}
              />
            ))}
          </Table.Tbody>
        </Table>
      </div>
      {isFetchingNextPage && (
        <Center p="md">
          <Loader size="sm" />
        </Center>
      )}
      {selectedAction && (
        <>
          <EditActionModal
            selectedAction={selectedAction}
            opened={modalState.openEditModal}
            onClose={handleCloseModal}
          />
          <DeleteActionDialog
            action={selectedAction}
            opened={modalState.openDeleteDialog}
            onClose={handleCloseModal}
            needRedirect
          />
        </>
      )}
      {/* <EditFeatureFlagModal
        featureFlag={selectedFeatureFlag}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
      <DeleteFeatureFlagDialog
        featureFlag={selectedFeatureFlag}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      /> */}
    </div>
  );
};
