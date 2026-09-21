import { Table, Text, useMantineColorScheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { SegmentTableItem } from './SegmentTableItem';
import { useGetSegmentsByProjectId } from '../../../../entities/Segment/api/useGetSegmentsByProjectId';
import { EditSegmentModal } from '../../../../features/Segment/EditSegment';
import { useState } from 'react';
import type { Segment } from '@/entities/Segment';
import type { Nullable } from '@/shared/types/types';
import { DeleteSegmentDialog } from '@/features/Segment/DeleteSegment';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { CopySegmentToProjectDialog } from '@/features/Segment/CopySegmentToProject';
import { useGetProjects } from '@/entities/Project';

export const SegmentsTable = () => {
  const { projectId } = useParams();
  const [selectedSegment, setSelectedSegment] =
    useState<Nullable<Segment>>(null);
  const { data: segments } = useGetSegmentsByProjectId(projectId);
  const { colorScheme } = useMantineColorScheme();

  const { data: projects } = useGetProjects();

  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
    openCopyDialog: false,
  });

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
      openCopyDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedSegment(null);
    }, 500);
    return clearTimeout(t);
  };

  const handleOpenEdit = (segment: Segment) => {
    setSelectedSegment(segment);
    handleOpenModal(true, 'openEditModal');
  };

  const handleOpenDelete = (segment: Segment) => {
    setSelectedSegment(segment);
    handleOpenModal(true, 'openDeleteDialog');
  };

  const handleOpenCopy = (segment: Segment) => {
    setSelectedSegment(segment);
    handleOpenModal(true, 'openCopyDialog');
  };

  const isCopySegmentDisabled = (projects || [])?.filter((project) => project.slug !== projectId).length === 0;

  if (!segments?.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text size="sm" c="dimmed">No segments found</Text>
      </div>
    );
  }
  return (
    <>
      <div className="overflow-x-auto lg:overflow-visible">
        <Table
          classNames={{
            td: '!px-4 whitespace-nowrap',
            th: '!px-4 whitespace-nowrap',
          }}
          className="min-w-[700px]"
        >
          <Table.Thead className='bg-gray-100 dark:bg-dark lg:sticky lg:top-[60px] lg:z-[100]'>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Key</Table.Th>
              <Table.Th>Rules</Table.Th>
              <Table.Th>Updated</Table.Th>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.SEGMENT_UPDATE}
              >
                <Table.Th ta="right">Actions</Table.Th>
              </RequiredProjectPermissionsWrapper>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {segments?.map((segment) => (
              <SegmentTableItem
                key={segment.id}
                segment={segment}
                colorScheme={colorScheme}
                onEditSegment={handleOpenEdit}
                onDeleteSegment={handleOpenDelete}
                onCopySegment={handleOpenCopy}
                isCopySegmentDisabled={isCopySegmentDisabled}
              />
            ))}
          </Table.Tbody>
        </Table>
      </div>
      <EditSegmentModal
        segment={selectedSegment}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
      <DeleteSegmentDialog
        segment={selectedSegment}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      />
      <CopySegmentToProjectDialog
        segment={selectedSegment}
        opened={modalState.openCopyDialog}
        onClose={handleCloseModal}
      />
    </>
  );
};
