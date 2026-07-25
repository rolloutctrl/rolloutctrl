import {
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import type { ProjectWithStats } from '../model/types';
import { Link } from 'react-router-dom';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBolt,
  IconFlag,
} from '@tabler/icons-react';

type ProjectCardProps = {
  project: ProjectWithStats;
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const hasErrors = project.errorCount > 0;
  const hasWarnings = project.warningCount > 0;

  return (
    <Card
      component={Link}
      to={`/project/${project.slug}`}
      padding={0}
      withBorder
      radius="md"
      style={{ textDecoration: 'none' }}
    >
      <Stack gap="xs">
        <Group
          justify="space-between"
          wrap="nowrap"
          align="flex-start"
          p="md"
          ta="left"
        >
          <Stack gap={2}>
            <Text fw={600} size="md" lineClamp={1}>
              {project.name}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              /{project.slug}
            </Text>
          </Stack>

          <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
            {hasErrors && (
              <Tooltip
                label={`${project.errorCount} strategy error${project.errorCount > 1 ? 's' : ''}`}
                withArrow
              >
                <Badge
                  size="sm"
                  color="red"
                  variant="light"
                  leftSection={<IconAlertCircle size={12} />}
                >
                  {project.errorCount}
                </Badge>
              </Tooltip>
            )}
            {hasWarnings && (
              <Tooltip
                label={`${project.warningCount} strategy warning${project.warningCount > 1 ? 's' : ''}`}
                withArrow
              >
                <Badge
                  size="sm"
                  color="yellow"
                  variant="light"
                  leftSection={<IconAlertTriangle size={12} />}
                >
                  {project.warningCount}
                </Badge>
              </Tooltip>
            )}
            {!hasErrors && !hasWarnings && (
              <Badge size="sm" color="green" variant="light">
                Healthy
              </Badge>
            )}
          </Group>
        </Group>

        <Divider />

        <Group grow p="md">
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon size="sm" variant="light" color="blue" radius="sm">
              <IconFlag size={13} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              {project.totalActiveFlags
                ? `${project.totalActiveFlags} Active flags`
                : 'No active flags'}
            </Text>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <ThemeIcon size="sm" variant="light" color="violet" radius="sm">
              <IconBolt size={13} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              {project.totalActiveActions
                ? `${project.totalActiveActions} Active actions`
                : 'No active actions'}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};
