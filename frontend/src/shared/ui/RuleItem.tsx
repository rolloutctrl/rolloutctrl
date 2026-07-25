import { Badge, Group, Text, Stack, HoverCard } from '@mantine/core';
import { IconUsers, IconCalendar } from '@tabler/icons-react';
import type { Operator } from '../types/enums';
import type { Nullable } from '../types/types';
import type { Segment } from '@/entities/Segment';
import { OPERATOR_CONFIG } from '../constants/consts';
import dayjs from 'dayjs';
import { formatInTimezone } from '../utils/formatInTimezone';

type RuleItemProps = {
  field?: string;
  operator?: Operator;
  value?: string;
  not?: boolean;
  startsAt?: Nullable<string>;
  endsAt?: Nullable<string>;
  segment?: Nullable<Segment>;
  timezone?: Nullable<string>;
};

const DateRangeRow = ({
  startsAt,
  endsAt,
  timezone,
}: {
  startsAt?: Nullable<string>;
  endsAt?: Nullable<string>;
  timezone?: Nullable<string>;
}) => (
  <Group gap="xs" wrap="wrap" align="center">
    <IconCalendar
      size={16}
      color="var(--mantine-color-blue-6)"
      className="shrink-0"
    />
    {startsAt && timezone && (
      <>
        <Text size="sm" c="dimmed">
          Start from
        </Text>
        <Badge size="sm" variant="light" color="blue">
          {formatInTimezone(startsAt, timezone)}
          {' : '}
          {timezone}
        </Badge>
        <Badge size="sm" variant="outline" color="gray.6">
          {dayjs(startsAt).format('DD MMM YYYY HH:mm')}
          {' : '}Browser time
        </Badge>
      </>
    )}
    {endsAt && timezone && (
      <>
        <Text size="sm" c="dimmed">
          End at
        </Text>
        <Badge size="sm" variant="light" color="blue">
          {formatInTimezone(endsAt, timezone)}
          {' : '}
          {timezone}
        </Badge>
        <Badge size="sm" variant="outline" color="gray.6">
          {dayjs(endsAt).format('DD MMM YYYY HH:mm')}
          {' : '}Browser time
        </Badge>
      </>
    )}
  </Group>
);

export const RuleItem = (props: RuleItemProps) => {
  const { segment, operator, value, field, not, startsAt, endsAt, timezone } =
    props;

  const hasDateRange = startsAt || endsAt || timezone;

  if (segment) {
    return (
      <Group
        className="flex flex-row w-full items-center px-4 py-2 bg-gray-100 dark:bg-dark rounded-md"
        gap="xs"
      >
        <IconUsers size={16} color="var(--mantine-color-blue-6)" />
        <Text size="sm" c="dimmed">
          Segment:
        </Text>
        <HoverCard
          width={280}
          shadow="none"
          withinPortal
          openDelay={200}
          closeDelay={100}
        >
          <HoverCard.Target>
            <Badge size="sm" variant="light" color="blue">
              {segment.name}
            </Badge>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Stack gap="xs">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Segment rules
              </Text>
              {segment?.rules?.length > 0 ? (
                segment.rules
                  .slice()
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => (
                    <Group key={rule.id} gap="xs" wrap="nowrap">
                      <Badge variant="light" size="xs" miw={60}>
                        {rule?.field}
                      </Badge>
                      <Badge variant="outline" size="xs" color="gray">
                        {rule?.operator}
                      </Badge>
                      <Text size="xs" truncate="end" style={{ flex: 1 }}>
                        {rule?.value}
                      </Text>
                    </Group>
                  ))
              ) : (
                <Text size="xs" c="dimmed">
                  No rules defined
                </Text>
              )}
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    );
  }

  if (!operator) {
    if (!hasDateRange) return null;
    return (
      <Stack
        className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-dark"
        gap="xs"
      >
        <DateRangeRow startsAt={startsAt} endsAt={endsAt} timezone={timezone} />
      </Stack>
    );
  }

  const config = OPERATOR_CONFIG[operator];
  const operatorLabel = not ? config.notLabel : config.label;

  return (
    <Stack
      className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-dark"
      gap="xs"
    >
      <Group gap="xs" wrap="wrap">
        <Text size="xs" fw={500}>
          {field}
        </Text>
        <Badge size="xs" variant="dot" color={not ? 'red' : 'blue'}>
          {operatorLabel}
        </Badge>
        <Text size="xs" c="dimmed">
          {value}
        </Text>
      </Group>

      {hasDateRange && <DateRangeRow startsAt={startsAt} endsAt={endsAt} />}
    </Stack>
  );
};
