import { Progress, Table, Text } from '@mantine/core';

type ActiveRollout = {
  flagKey: string;
  env: string;
  rolloutPercentage: number;
};

type ActiveRolloutsTableProps = {
  activeRollouts: ActiveRollout[];
};

export const ActiveRolloutsTable = ({
  activeRollouts,
}: ActiveRolloutsTableProps) => {
  // Get unique environments and flag keys
  const environments = Array.from(
    new Set(activeRollouts.map((r) => r.env)),
  ).sort();

  const flagKeys = Array.from(
    new Set(activeRollouts.map((r) => r.flagKey)),
  ).sort();

  // Create lookup map: flagKey -> env -> percentage
  const rolloutMap = new Map<string, Map<string, number>>();

  activeRollouts.forEach((r) => {
    if (!rolloutMap.has(r.flagKey)) {
      rolloutMap.set(r.flagKey, new Map());
    }
    rolloutMap.get(r.flagKey)!.set(r.env, r.rolloutPercentage);
  });

  if (environments.length === 0 || flagKeys.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No active rollouts
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th ta="left" px="md">Flag Key</Table.Th>
          {environments.map((env) => (
            <Table.Th key={env} ta="center" px="md" className='capitalize'>
              {env}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {flagKeys.map((flagKey) => (
          <Table.Tr key={flagKey}>
            <Table.Td ta="left" px="md">
              <Text size="sm" fw={500}>
                {flagKey}
              </Text>
            </Table.Td>
            {environments.map((env) => {
              const percentage = rolloutMap.get(flagKey)?.get(env);

              return (
                <Table.Td key={env} ta="center" px="md">
                  {percentage !== undefined ? (
                    <div className="flex flex-col items-center gap-1">
                      <Progress
                        value={percentage}
                        color={percentage === 100 ? 'rollout' : 'indigo'}
                        size="xs"
                        radius="xl"
                        w={100}
                      />
                      <Text size="xs" c="dimmed">
                        {percentage}%
                      </Text>
                    </div>
                  ) : (
                    <Text size="xs" c="gray.4">
                      —
                    </Text>
                  )}
                </Table.Td>
              );
            })}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
