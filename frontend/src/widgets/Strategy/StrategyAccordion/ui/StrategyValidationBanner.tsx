import { useState } from 'react';
import {
  Alert,
  Badge,
  Collapse,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { ValidationIssue } from '../lib/validateStrategies';

type StrategyValidationBannerProps = {
  issues: ValidationIssue[];
  strategyCount: number;
};

export const StrategyValidationBanner = ({
  issues,
  strategyCount,
}: StrategyValidationBannerProps) => {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');
  const hasErrors = errors.length > 0;
  const hasIssues = issues.length > 0;
  const hasInfos = infos.length > 0;

  const [expanded, setExpanded] = useState(hasErrors);

  if (hasInfos) {
    return (
      <Alert
        color="blue"
        variant="light"
        icon={<IconInfoCircle size={16} />}
        radius="md"
        mb="sm"
        py="xs"
      >
        {infos.map((info) => (
          <Text key={info.code} size="sm" c="blue.7" ta="left">
            {info.message}
          </Text>
        ))}
      </Alert>
    );
  }

  if (!hasIssues) {
    return (
      <Alert
        color="green"
        variant="light"
        icon={<IconCircleCheck size={16} />}
        radius="md"
        mb="sm"
        py="xs"
      >
        <Text size="sm" c="green.8" ta="left">
          All checks passed —{' '}
          <strong>
            {strategyCount} {strategyCount === 1 ? 'strategy' : 'strategies'}
          </strong>{' '}
          evaluated. No conflicts or issues detected.
        </Text>
      </Alert>
    );
  }

  const summaryParts = [
    errors.length > 0
      ? `${errors.length} error${errors.length > 1 ? 's' : ''}`
      : '',
    warnings.length > 0
      ? `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`
      : '',
  ]
    .filter(Boolean)
    .join(', ');

  const color = hasErrors ? 'red' : 'yellow';

  return (
    <Alert
      color={color}
      variant="light"
      icon={
        hasErrors ? (
          <IconAlertCircle size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )
      }
      radius="md"
      mb="sm"
      py="xs"
    >
      <UnstyledButton onClick={() => setExpanded((e) => !e)} className="w-full">
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={500} ta="left">
            {summaryParts} detected in strategies
          </Text>
          {expanded ? (
            <IconChevronUp size={14} />
          ) : (
            <IconChevronDown size={14} />
          )}
        </Group>
      </UnstyledButton>

      <Collapse expanded={expanded}>
        <Stack gap={6} mt="xs">
          {issues.map((issue, idx) => (
            <Group key={idx} gap="xs" wrap="nowrap" align="flex-start">
              <Badge
                size="xs"
                color={issue.severity === 'error' ? 'red' : 'yellow'}
                variant="filled"
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                {issue.severity}
              </Badge>
              <Text size="xs" lh={1.5} ta="left">
                {issue.message}
              </Text>
            </Group>
          ))}
        </Stack>
      </Collapse>
    </Alert>
  );
};
