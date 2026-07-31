import { useMemo, type FC } from 'react';
import { Field, type FieldProps } from 'formik';
import {
  MultiSelect,
  HoverCard,
  Pill,
  Stack,
  Text,
  Group,
  Badge,
} from '@mantine/core';
import type { Segment } from '@/entities/Segment';

type SegmentsMultiSelectFieldProps = {
  name: string;
  segments: Segment[];
  label?: string;
  description?: string;
  disabled?: boolean;
};

export const SegmentsMultiSelectField: FC<SegmentsMultiSelectFieldProps> = ({
  name,
  segments,
  label,
  description,
  disabled,
}) => {
  const segmentMap = useMemo(
    () => new Map((segments || []).map((s) => [s.id, s])),
    [segments],
  );

  const options = useMemo(
    () => (segments || [])?.map((s) => ({ value: s.id, label: s.name })),
    [segments],
  );

  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => (
        <MultiSelect
          {...field}
          name={name}
          label={label}
          description={description}
          data={options}
          value={field.value}
          onChange={(value) => form.setFieldValue(name, value)}
          disabled={disabled}
          error={meta.touched && meta.error}
          searchable
          checkIconPosition="right"
          renderPill={({ option, onRemove, disabled: pillDisabled }) => {
            const segment = segmentMap.get(option?.value as string);
            const rules = segment?.rules ?? [];

            return (
              <HoverCard
                key={option?.value as string}
                width={280}
                shadow="none"
                withinPortal
                openDelay={200}
                closeDelay={100}
              >
                <HoverCard.Target>
                  <Pill
                    withRemoveButton={!pillDisabled}
                    onRemove={onRemove}
                    style={{ cursor: 'default' }}
                  >
                    {option?.label}
                  </Pill>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Stack gap="xs">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Segment rules
                    </Text>
                    {rules?.length > 0 ? (
                      rules
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
            );
          }}
        />
      )}
    </Field>
  );
};
