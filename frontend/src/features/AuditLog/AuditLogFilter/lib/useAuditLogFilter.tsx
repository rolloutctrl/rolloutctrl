/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQueryClient } from '@tanstack/react-query';
import { useAuditLogsFilterStore } from '../model/store';
import { AuditAction, ResourceType } from '@/shared/types/enums';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { useGetProjectMembers } from '@/entities/Project';
import { useParams } from 'react-router-dom';
import { getAuditLogsQueryKey } from '@/shared/constants/consts';

export const useAuditLogsFilter = () => {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const {
    userId,
    action,
    search,
    resourceType,
    dateRange,
    handleInput,
    handleSelect,
    setDateRange,
    clearFilters,
  } = useAuditLogsFilterStore();

  const [localSearch, setLocalSearch] = useState(search);

  const { data: members } = useGetProjectMembers(projectId);

  const [debounced] = useDebouncedValue(localSearch, 200);

  useEffect(() => {
    handleInput('search', debounced);
  }, [debounced, handleInput]);

  const usersOptions = (members || [])?.map((user) => ({
    value: user.user.id,
    label: user.user.name || user.user.email,
  }));

  const actionOptions = Object.entries(AuditAction).map(([_, value]) => ({
    value: value,
    label: value,
  }));

  const resourceTypeOptions = Object.entries(ResourceType).map(
    ([_, value]) => ({
      value: value,
      label: value,
    }),
  );

  const handleInvalidateStore = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: [getAuditLogsQueryKey],
        type: 'all',
      }),
    ]);

  const handleClearStore = useDebouncedCallback(() => {
    Promise.all([clearFilters(), handleInvalidateStore()]);
  }, 500);

  const handleClearSelect = (name: string, value: null | []) =>
    handleSelect(name, value);

  const handleClearDates = () => setDateRange([null, null]);

  const isFilterActive = useMemo(
    () =>
      !!userId ||
      !!action ||
      !!resourceType ||
      dateRange.some((date) => date !== null),
    [userId, action, resourceType, dateRange],
  );
  return {
    userId,
    action,
    resourceType,
    search,
    dateRange,
    usersOptions,
    actionOptions,
    resourceTypeOptions,
    localSearch,
    handleSelect,
    setDateRange,
    setLocalSearch,
    handleClearStore,
    handleClearDates,
    handleInput,
    handleClearSelect,
    isFilterActive,
  };
};
