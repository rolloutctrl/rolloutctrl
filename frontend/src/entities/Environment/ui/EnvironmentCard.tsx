import { Card, Group, Text } from '@mantine/core';
import type { EnvironmentWithCounts } from '../model/types';

type EnvironmentCardProps = {
  environment: EnvironmentWithCounts;
  menuSlot?: React.ReactNode;
};

export const EnvironmentCard = ({ environment, menuSlot }: EnvironmentCardProps) => {
  return (
    <Card radius="md" ta="left" h="100%" className='flex flex-col justify-between min-h-[6.25rem]' withBorder>
      <div className="flex items-center justify-between">
        <Text fw={600} size="md" className="capitalize">
          {environment.name}
        </Text>
        {menuSlot}
      </div>
      <Group>
        <Text size="sm">{environment.enabledFlagsCount > 0 ? `${environment.enabledFlagsCount} Active flags` : 'No active flags'}</Text>
      </Group>
    </Card>
  );
};
