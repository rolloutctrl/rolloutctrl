import {
  ActionIcon as MantineActionButton,
  Select,
  TextInput,
} from '@mantine/core';
import {
  DateTimePicker,
  type DatesRangeValue,
  type DateValue,
} from '@mantine/dates';

import { useAuditLogsFilter } from '../lib/useAuditLogFilter';
import { IconFilterOff, IconSearch } from '@tabler/icons-react';

export const AuditLogFilter = () => {
  const {
    userId,
    resourceType,
    handleClearStore,
    resourceTypeOptions,
    dateRange,
    action,
    actionOptions,
    isFilterActive,
    usersOptions,
    handleSelect,
    handleClearDates,
    setDateRange,
    handleClearSelect,
    localSearch,
    setLocalSearch,
  } = useAuditLogsFilter();
  return (
    <div className="flex flex-row w-full gap-2 p-4">
      <TextInput
        name="search"
        placeholder="Flag key, strategy, user..."
        value={localSearch}
        className="grow-2"
        leftSection={<IconSearch size={16} className='text-gray-400' />}
        onChange={(event) => setLocalSearch(event.currentTarget.value)}
      />
      <Select
        name="userId"
        placeholder="User"
        value={userId}
        data={usersOptions}
        checkIconPosition="right"
        onChange={(value) => handleSelect('userId', value)}
        clearable
        onClear={() => handleClearSelect('userId', null)}
      />
      <Select
        name="resourceType"
        placeholder="Resource type"
        value={resourceType}
        data={resourceTypeOptions}
        checkIconPosition="right"
        onChange={(value) => handleSelect('resourceType', value)}
        clearable
        onClear={() => handleClearSelect('resourceType', null)}
      />
      <Select
        name="action"
        placeholder="Action"
        value={action}
        data={actionOptions}
        checkIconPosition="right"
        onChange={(value) => handleSelect('action', value)}
        clearable
        onClear={() => handleClearSelect('action', null)}
      />

      <DateTimePicker
        name="dateRange"
        type="range"
        placeholder="Date"
        value={dateRange as DatesRangeValue<DateValue>}
        onChange={(values) =>
          setDateRange(
            values.map((v) => (v ? new Date(v) : null)) as [
              Date | null,
              Date | null,
            ],
          )
        }
        valueFormat="DD/MM/YY"
        clearable
        className="grow-2"
        clearButtonProps={{
          onClick: () => handleClearDates(),
        }}
      />
      <div className="flex flex-row justify-start">
        <MantineActionButton
          // classNames={{
          //   root: 'w-[2.25rem] h-[2.25rem] shrink-0',
          // }}
          type="button"
          size={36}
          color={isFilterActive ? 'orange.5' : 'gray'}
          variant="light"
          onClick={handleClearStore}
        >
          <IconFilterOff size={14} />
        </MantineActionButton>
      </div>
    </div>
  );
};
