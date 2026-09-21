import {
  Center,
  Loader,
  Table,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useGetVariantsByFlagId, type Variant } from '@/entities/Variant';
import { VariantTableItem } from './VariantTableItem';
import { useState } from 'react';
import type { Nullable } from '@/shared/types/types';
import { DeleteVariantDialog } from '@/features/Variant/DeleteVariant';
import { EditVariantDialog } from '@/features/Variant/EditVariant';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { useParams } from 'react-router-dom';

type VariantsTableProps = {
  flagId?: string;
  environmentId?: string;
};

export const VariantsTable = ({
  flagId,
  environmentId,
}: VariantsTableProps) => {
  const { projectId } = useParams();
  const [selectedVariant, setSelectedVariant] =
    useState<Nullable<Variant>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const { colorScheme } = useMantineColorScheme();
  const {
    data: variants,
    isLoading,
    isError,
  } = useGetVariantsByFlagId(flagId, projectId, environmentId);

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedVariant(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (variant: Variant) => {
    setSelectedVariant(variant);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (variant: Variant) => {
    setSelectedVariant(variant);
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
        <Text c="red">Failed to load variants</Text>
      </Center>
    );
  }

  if (!variants?.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text c="dimmed" size="sm">
          No variants found
        </Text>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto lg:overflow-visible"> 
      <Table
        classNames={{
          td: '!px-4 whitespace-nowrap',
          th: '!px-4 whitespace-nowrap',
        }}
        className="min-w-[700px]"
      >
        <Table.Thead
          className="bg-gray-100 dark:bg-dark lg:sticky lg:top-[60px] lg:z-[100]"
        >
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th w={180}>Payload type</Table.Th>
            <Table.Th>Payload</Table.Th>
            <Table.Th w={100}>Strategies</Table.Th>
            <Table.Th w={180}>Created</Table.Th>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.VARIANT_UPDATE}
            >
              <Table.Th w={50}>Actions</Table.Th>
            </RequiredProjectPermissionsWrapper>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {variants.map((variant) => (
            <VariantTableItem
              key={variant.id}
              variant={variant}
              colorScheme={colorScheme}
              onDeleteVariant={handleOpenDelete}
              onEditVariant={handleOpenEdit}
            />
          ))}
        </Table.Tbody>
      </Table>
      <DeleteVariantDialog
        variant={selectedVariant}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      />
      <EditVariantDialog
        variant={selectedVariant}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};
