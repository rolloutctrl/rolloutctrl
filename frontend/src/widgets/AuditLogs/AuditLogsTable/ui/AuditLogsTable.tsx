import { useGetAuditLogs } from '@/entities/AuditLog';
import { Table, Text, Center, Loader } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { AuditLogTableItem } from './AuditLogTableItem';
import { useAuditLogsFilterStore } from '@/features/AuditLog/AuditLogFilter/model/store';

export const AuditLogsTable = () => {
  const { projectId } = useParams();
  const { userId, action, search, resourceType, dateRange } =
    useAuditLogsFilterStore();

  const startDate = dateRange[0]
    ? new Date(dateRange[0]).toISOString()
    : undefined;
  const endDate = dateRange[1]
    ? new Date(dateRange[1]).toISOString()
    : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetAuditLogs({
    projectId,
    userId: userId ?? undefined,
    action: action ?? undefined,
    search: search ?? undefined,
    resourceType: resourceType ?? undefined,
    startDate,
    endDate,
  });

  const auditLogs = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

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
        <Text c="red">Failed to load audit logs</Text>
      </Center>
    );
  }

  if (!auditLogs.length) {
    return (
      <div className="flex flex-row w-full items-center justify-center p-8">
        <Text c="dimmed" size="sm">
          No audit logs found
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
          className="bg-gray-100 dark:bg-dark"
          style={{
            position: 'sticky',
            top: 60,
            zIndex: 100,
          }}
        >
          <Table.Tr>
            <Table.Th>Log</Table.Th>
            <Table.Th>User</Table.Th>
            <Table.Th w={120}>Action</Table.Th>
            <Table.Th w={160}>Resource Type</Table.Th>
            <Table.Th w={100}>Resource ID</Table.Th>
            <Table.Th w={180}>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {auditLogs.map((log) => (
            <AuditLogTableItem key={log.id} auditLog={log} />
          ))}
        </Table.Tbody>
      </Table>
      {isFetchingNextPage && (
        <Center p="md">
          <Loader size="sm" />
        </Center>
      )}
    </div>
  );
};
