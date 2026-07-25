import {
  ActionIcon as MantineActionButton,
  Badge,
  Card,
  Group,
  Text,
  Stack,
  Divider,
  Menu,
  type MantineColorScheme,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconGripVertical,
  IconPencil,
  IconPercentage,
  IconTrash,
} from '@tabler/icons-react';
import type { Strategy } from '@/entities/Strategy';
import { RuleItem } from '@/shared/ui';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { Link, useParams } from 'react-router-dom';
import { ToggleStrategyEnable } from '@/features/Strategy/ToggleStrategyEnable';
import { StrategyVariantsContainer } from '@/entities/Variant';

type StrategyItemProps = {
  strategy: Strategy;
  colorScheme: MantineColorScheme;
  onDeleteStrategy: (strategy: Strategy) => void;
  isDragging?: boolean;
};

export const StrategyItem = ({
  strategy,
  colorScheme,
  onDeleteStrategy,
  isDragging = false,
}: StrategyItemProps) => {
  const { projectId, featureFlagId } = useParams();

  console.log(projectId, featureFlagId);
  return (
    <Card
      p="md"
      radius="md"
      withBorder
      style={{
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? 'var(--mantine-color-gray-1)' : undefined,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <IconGripVertical
          size={16}
          style={{ color: 'var(--mantine-color-gray-6)', marginTop: 4 }}
        />
        <Stack gap="sm" className="flex-1">
          {/* Strategy name and priority */}
          <Group justify="space-between">
            <Group gap="xs">
              <Text
                component={Link}
                to={`/project/${projectId}/feature-flags/${featureFlagId}/strategies/${strategy.id}/edit?env=${strategy.featureFlagEnvironmentId}`}
                size="sm"
                fw={600}
                className="hover:text-rollout transition"
              >
                {strategy.name || `Strategy #${strategy.id.slice(0, 8)}`}
              </Text>
            </Group>

            <Group gap="xs">
              <Badge size="xs" variant="light" color="gray">
                Priority: {strategy.priority}
              </Badge>
              <Menu shadow="none" width={120} position="bottom-end">
                <Menu.Target>
                  <MantineActionButton
                    variant={colorScheme === 'light' ? 'light' : 'subtle'}
                    size="md"
                    color="gray"
                    aria-label="Feature Flag actions"
                  >
                    <IconDotsVertical size={14} />
                  </MantineActionButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <RequiredProjectPermissionsWrapper
                    permissions={[PermissionCode.FLAG_STRATEGY_UPDATE]}
                  >
                    <Menu.Item
                      component={Link}
                      leftSection={<IconPencil size={14} />}
                      to={`/project/${projectId}/feature-flags/${featureFlagId}/strategies/${strategy.id}/edit?env=${strategy.featureFlagEnvironmentId}`}
                    >
                      Edit
                    </Menu.Item>
                  </RequiredProjectPermissionsWrapper>
                  <RequiredProjectPermissionsWrapper
                    permissions={PermissionCode.FLAG_STRATEGY_DELETE}
                  >
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => onDeleteStrategy(strategy)}
                    >
                      Delete
                    </Menu.Item>
                  </RequiredProjectPermissionsWrapper>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          <Group justify="space-between">
            <Group gap="xs">
              <ToggleStrategyEnable
                strategy={strategy}
                label={strategy.enabled ? 'Strategy ON' : 'Strategy OFF'}
                withThumbIndicator={false}
              />
            </Group>
          </Group>

          {/* Rollout percentage */}
          {strategy.rolloutPercentage !== null &&
            strategy.rolloutPercentage !== undefined && (
              <Group gap="xs">
                <IconPercentage
                  size={16}
                  color="var(--mantine-color-green-6)"
                />
                <Text size="sm" c="dimmed">
                  Rollout:
                </Text>
                <Badge size="sm" variant="light" color="green">
                  {strategy.rolloutPercentage}%
                </Badge>
              </Group>
            )}

          {/* Conditions: segment + rules + schedule */}
          {(strategy.segments?.length ||
            strategy.rules?.length > 0 ||
            strategy.startsAt ||
            strategy.endsAt) && (
            <>
              <Divider />
              <div className="flex flex-col">
                <Text size="xs" fw={500} c="dimmed" mb="xs" ta="left">
                  Target conditions
                </Text>
                <Stack gap="xs">
                  {(strategy.segments || [])?.map((segment) => (
                    <RuleItem key={segment.id} segment={segment} />
                  ))}
                  {strategy.rules?.map((rule) => (
                    <RuleItem key={rule.id} {...rule} />
                  ))}
                  {(strategy.startsAt ||
                    strategy.endsAt ||
                    strategy.timezone) && (
                    <RuleItem
                      startsAt={
                        strategy.startsAt
                          ? String(strategy.startsAt)
                          : undefined
                      }
                      endsAt={
                        strategy.endsAt ? String(strategy.endsAt) : undefined
                      }
                      timezone={strategy.timezone || undefined}
                    />
                  )}
                </Stack>
              </div>
            </>
          )}
          {strategy.strategyVariants && !!strategy.strategyVariants.length && (
            <StrategyVariantsContainer
              strategyVariants={strategy.strategyVariants}
            />
          )}
        </Stack>
      </Group>
    </Card>
  );
};
