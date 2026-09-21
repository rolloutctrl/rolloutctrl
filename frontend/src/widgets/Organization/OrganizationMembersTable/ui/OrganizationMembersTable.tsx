import { Table, Text, Center, Loader } from '@mantine/core';
import { useState } from 'react';
import type { Nullable } from '@/shared/types/types';
import { useGetOrganizationMembers } from '@/entities/Organization';
import { OrganizationMemberTableItem } from './OrganizationMemberTableItem';
import { DeleteOrganizationMemberDialog } from '@/features/Organization/DeleteOrganizationMember';
import { EditOrganizationMemberModal } from '@/features/Organization/EditOrganizationMember';
import { type User } from '@/entities/User';

export const OrganizationMembersTable = () => {
  const [selectedMember, setSelectedMember] = useState<Nullable<User>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const { data: members, isLoading, isError } = useGetOrganizationMembers();

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedMember(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (member: User) => {
    setSelectedMember(member);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (member: User) => {
    setSelectedMember(member);
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

  if (!members?.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text c="dimmed" size="sm">
          No members found
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
        <Table.Thead className="bg-gray-100 dark:bg-dark lg:sticky lg:top-[60px] lg:z-[100]">
          <Table.Tr>
            <Table.Th>Member</Table.Th>
            <Table.Th w={350}>Projects</Table.Th>
            <Table.Th w={180}>Created</Table.Th>
            <Table.Th w={100}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {members?.map((member) => (
            <OrganizationMemberTableItem
              key={member.id}
              member={member}
              onEditMember={handleOpenEdit}
              onDeleteMember={handleOpenDelete}
            />
          ))}
        </Table.Tbody>
      </Table>
      <EditOrganizationMemberModal
        opened={modalState.openEditModal}
        member={selectedMember}
        onClose={handleCloseModal}
      />
      <DeleteOrganizationMemberDialog
        opened={modalState.openDeleteDialog}
        member={selectedMember}
        onClose={handleCloseModal}
      />
    </div>
  );
};
