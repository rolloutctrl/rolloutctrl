import {
  useGetProjectById,
  useGetProjectOverviewById,
} from '@/entities/Project';
import {
  Avatar,
  Badge,
  // Card,
  Paper,
  Grid,
  Group,
  Skeleton,
  Progress,
  // Stack,
  Text,
  Title,
  Center,
  HoverCard,
} from '@mantine/core';
import {
  IconToggleRightFilled,
  IconStack2,
  IconBolt,
  // IconServer,
  IconChartBar,
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { ActiveRolloutsTable } from './ActiveRolloutsTable';
import { TeamRole } from '@/shared/types/enums';

const StatCard = ({
  icon: Icon,
  label,
  total,
  active,
  color,
}: {
  icon: React.ElementType;
  label: string;
  total: number;
  active: number;
  color: string;
}) => {
  const percent = total > 0 ? Math.round((active / total) * 100) : 0;
  return (
    <Paper p="md" radius="md" withBorder h="100%">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs">
          <Avatar size="sm" color={color} variant="light" radius="sm">
            <Icon size={14} />
          </Avatar>
          <Text size="sm" fw={500} c="dimmed">
            {label}
          </Text>
        </Group>
        <Badge size="sm" variant="light" color={active > 0 ? color : 'gray'}>
          {active} active
        </Badge>
      </Group>
      <Title order={2} fw={700} mb={4}>
        {total}
      </Title>
      <Progress value={percent} color={color} size="xs" radius="xl" mt="xs" />
      <Text size="xs" c="dimmed" mt={4}>
        {percent}% active
      </Text>
    </Paper>
  );
};

export const ProjectOverviewView = () => {
  const { projectId } = useParams();

  const { data: project, isLoading } = useGetProjectById(projectId);
  const { data: overview, isLoading: isOverviewLoading } =
    useGetProjectOverviewById(projectId || '');

  if (isLoading || isOverviewLoading) {
    return (
      <Grid columns={24} gap="md">
        <Grid.Col span={24}>
          <Skeleton height={80} radius="md" />
        </Grid.Col>
        {[...Array(3)].map((_, i) => (
          <Grid.Col key={i} span={{ base: 24, sm: 8 }}>
            <Skeleton height={110} radius="md" />
          </Grid.Col>
        ))}
        <Grid.Col span={{ base: 24, sm: 12 }}>
          <Skeleton height={180} radius="md" />
        </Grid.Col>
        <Grid.Col span={{ base: 24, sm: 12 }}>
          <Skeleton height={180} radius="md" />
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <Grid columns={24} gap="md">
      <Grid.Col span={24}>
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <div className="flex flex-col items-start">
              <Title
                order={2}
                fw={700}
                size="xl"
                ta="left"
                // className="space-grotesk-bold"
              >
                {project?.name}
              </Title>
              <Text size="sm" c="dimmed" mt={2} ta="left">
                {project?.description ?? 'No description'}
              </Text>
            </div>
            {overview?.members?.length && (
              <Avatar.Group>
                {overview.members.map((member) => (
                  <HoverCard key={member.id}>
                    <HoverCard.Target>
                      <Avatar
                        src={member.user.avatar || undefined}
                        size={32}
                        alt={member.user.name}
                      />
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text size="sm">{member.user.name}</Text>
                      <Text size="xs" c="dimmed">
                        {member.user.email}
                      </Text>
                      <Badge
                        size="xs"
                        variant="dot"
                        color={
                          member?.role === TeamRole.OWNER ? 'rollout' : 'orange'
                        }
                      >
                        {member?.role}
                      </Badge>
                    </HoverCard.Dropdown>
                  </HoverCard>
                ))}
                {overview.members.length > 3 && (
                  <Avatar size={32}>+{overview.members.length - 3}</Avatar>
                )}
              </Avatar.Group>
            )}
          </Group>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 24, sm: 8 }}>
        <StatCard
          icon={IconToggleRightFilled}
          label="Feature Flags"
          total={overview?.featureFlags.total ?? 0}
          active={overview?.featureFlags.active ?? 0}
          color="rollout"
        />
      </Grid.Col>
      <Grid.Col span={{ base: 24, sm: 8 }}>
        <StatCard
          icon={IconStack2}
          label="Segments" 
          total={overview?.segments.total ?? 0}
          active={overview?.segments.active ?? 0}
          color="rollout"
        />
      </Grid.Col>
      <Grid.Col span={{ base: 24, sm: 8 }}>
        <StatCard
          icon={IconBolt}
          label="Actions"
          total={overview?.actions.total ?? 0}
          active={overview?.actions.active ?? 0}
          color="rollout"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 24, sm: 24 }}>
        <Paper p={0} radius="md" withBorder h="100%" className="!overflow-clip">
          <Group gap="xs" mb="md" px="md" pt="md">
            <Avatar size="sm" color="rollout" variant="light" radius="sm">
              <IconChartBar size={14} />
            </Avatar>
            <Text size="sm" fw={500} c="dimmed">
              Active Rollouts
            </Text>
            <Badge size="sm" variant="light" color="rollout" ml="auto">
              {overview?.activeRollouts?.length ?? 0}
            </Badge>
          </Group>
          {overview?.activeRollouts && overview.activeRollouts.length > 0 ? (
            <ActiveRolloutsTable activeRollouts={overview.activeRollouts} />
          ) : (
            <Center p="lg">
              <Text size="sm" c="dimmed" ta="center">
                No active rollouts
              </Text>
            </Center>
          )}
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
