import { Select } from '@mantine/core';
import { useSelectCurrentProject } from '../lib/useSelectCurrentProject';

type SelectCurrentProjectProps = {
  createProjectButtonSlot?: React.ReactNode;
};

export const SelectCurrentProject = ({
  createProjectButtonSlot,
}: SelectCurrentProjectProps) => {
  const { projectOptions, selectedProjectId, handleSelectProject } =
    useSelectCurrentProject();
  return (
    <div className='flex flex-row w-full items-end justify-start gap-x-2'>
      <Select
        label="Project"
        placeholder="Select project"
        data={projectOptions}
        checkIconPosition="right"
        value={selectedProjectId}
        onChange={(value) => value && handleSelectProject(value)}
        maxDropdownHeight={150}
        withScrollArea
        allowDeselect={false}
        className="flex-1"
        styles={{
          label: {
            fontSize: '0.75rem',
          },
        }}
      />
      {createProjectButtonSlot}
    </div>
  );
};
