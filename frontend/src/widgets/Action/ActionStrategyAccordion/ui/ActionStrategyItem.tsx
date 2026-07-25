import { Badge, Card, Divider, Group, Stack, Text } from '@mantine/core';
import { IconBolt, IconGripVertical } from '@tabler/icons-react';
import { RuleItem } from '@/shared/ui';
import type { ActionStrategyBasic } from '@/entities/Action';

type ActionStrategyItemProps = {
  strategy: ActionStrategyBasic;
  isDragging?: boolean;
};

export const ActionStrategyItem = ({
  strategy,
  isDragging = false,
}: ActionStrategyItemProps) => {
  return (
    <Card
      p="md"
      radius="md"
      withBorder
      style={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <IconGripVertical
          size={16}
          style={{ color: 'var(--mantine-color-gray-6)', marginTop: 4 }}
        />
        <Stack gap="sm" className="flex-1">
        <Group justify="space-between">
          <Group gap="xs">
            <IconBolt size={16} color="var(--mantine-color-yellow-6)" />
            <Text size="sm" fw={600}>
              {strategy.name || `Strategy #${strategy.id.slice(0, 8)}`}
            </Text>
          </Group>
          <Group gap="xs">
            <Badge
              size="xs"
              variant="light"
              color={strategy.enabled ? 'teal' : 'gray'}
            >
              {strategy.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge size="xs" variant="light" color="indigo">
              Effect: {strategy.effect}
            </Badge>
            <Badge size="xs" variant="light" color="gray">
              Priority: {strategy.priority}
            </Badge>
          </Group>
        </Group>

        {(strategy.rules?.length > 0) && (
          <>
            <Divider />
            <div>
              <Text size="xs" fw={500} c="dimmed" mb="xs">
                Conditions:
              </Text>
              <Stack gap="xs">
                {strategy.rules.map((rule) => (
                  <RuleItem
                    key={rule.id}
                    field={rule.field}
                    operator={rule.operator}
                    value={rule.value}
                    not={rule.not}
                  />
                ))}
              </Stack>
            </div>
          </>
        )}

        {strategy.rules?.length === 0 && (
          <Text size="xs" c="dimmed">
            No conditions — matches all users
          </Text>
        )}
        </Stack>
      </Group>
    </Card>
  );
};
