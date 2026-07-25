import {
  useGetFeatureFlagsByProjectId,
  type FeatureFlag,
} from '@/entities/FeatureFlag';
import { Table, Text, Center, Loader, useMantineColorScheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FeatureFlagTableItem } from './FeatureFlagTableItem';
import type { Nullable } from '@/shared/types/types';
import { EditFeatureFlagModal } from '@/features/FeatureFlag/EditFeatureFlag';
import { DeleteFeatureFlagDialog } from '@/features/FeatureFlag/DeleteFeatureFlag';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

type FeatureFlagsTableProps = {
  includeArchived?: boolean;
};

export const FeatureFlagsTable = ({
  includeArchived = false,
}: FeatureFlagsTableProps) => {
  const { projectId } = useParams();
  const [selectedFeatureFlag, setSelectedFeatureFlag] =
    useState<Nullable<FeatureFlag>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });
  const { colorScheme } = useMantineColorScheme();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetFeatureFlagsByProjectId(projectId, includeArchived);

  const featureFlags = useMemo(() => {
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
      setSelectedFeatureFlag(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (flag: FeatureFlag) => {
    setSelectedFeatureFlag(flag);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (flag: FeatureFlag) => {
    setSelectedFeatureFlag(flag);
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

  if (!featureFlags.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text c="dimmed" size="sm">
          No feature flags found
        </Text>
      </div>
    );
  }

  return (
    <div className="relative">
      <Table
        classNames={{
          td: '!px-4',
          th: '!px-4',
        }}
      >
        <Table.Thead
          className='bg-gray-100 dark:bg-dark'
          style={{
            position: 'sticky',
            top: 60,
            zIndex: 100,
            // backgroundColor: 'white',
          }}
        >
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th w={450}>Environments</Table.Th>
            <Table.Th w={180}>Created</Table.Th>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.FLAG_UPDATE}
            >
              <Table.Th w={100}>Actions</Table.Th>
            </RequiredProjectPermissionsWrapper>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {featureFlags.map((flag) => (
            <FeatureFlagTableItem
              key={flag.id}
              featureFlag={flag}
              onEditFeatureFlag={handleOpenEdit}
              onDeleteFeatureFlag={handleOpenDelete}
              colorScheme={colorScheme}
            />
          ))}
        </Table.Tbody>
      </Table>
      {isFetchingNextPage && (
        <Center p="md">
          <Loader size="sm" />
        </Center>
      )}
      <EditFeatureFlagModal
        featureFlag={selectedFeatureFlag}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
      <DeleteFeatureFlagDialog
        featureFlag={selectedFeatureFlag}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      />
    </div>
  );
};
