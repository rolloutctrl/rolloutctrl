import { type FC, useState } from 'react';
import {
  ActionIcon,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { VariantPayloadType } from '@/shared/types/enums';
import { payloadTypeOptions } from '@/shared/constants/consts';
import type { AssignVariantItem } from '../model/types';
import { VARIANT_COLOR_NAMES, VARIANT_COLOR_HEX } from '../lib/consts';

type VariantCardProps = {
  variant: AssignVariantItem;
  index: number;
  disabled?: boolean;
  isNew?: boolean;
  onRemove: (index: number) => void;
  onWeightChange: (index: number, weight: number) => void;
  onCustomWeightToggle: (index: number, checked: boolean) => void;
  onFieldChange: (index: number, field: keyof AssignVariantItem, value: string) => void;
};

export const VariantCard: FC<VariantCardProps> = ({
  variant,
  index,
  disabled,
  isNew,
  onRemove,
  onWeightChange,
  onCustomWeightToggle,
  onFieldChange,
}) => {
  const colorName = VARIANT_COLOR_NAMES[index % VARIANT_COLOR_NAMES.length];
  const hex = variant.colorTag ?? variant.variant?.colorTag ?? VARIANT_COLOR_HEX[colorName];
  const displayName = variant.variant?.name ?? variant.name ?? `Variant ${index + 1}`;

  const [localWeight, setLocalWeight] = useState(variant.weight);
  const [prevWeight, setPrevWeight] = useState(variant.weight);
  if (variant.weight !== prevWeight) {
    setPrevWeight(variant.weight);
    setLocalWeight(variant.weight);
  }

  const debouncedWeightChange = useDebouncedCallback(
    (w: number) => onWeightChange(index, w),
    500,
  );

  return (
    <Paper p="sm" radius="md" withBorder className="bg-gray-100 dark:bg-dark-bg">
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: hex,
                flexShrink: 0,
              }}
            />
            <Text component="span" fw={500} size="md">
              {displayName}
            </Text>
          </Group>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        {isNew && (
          <Stack gap="xs">
            <TextInput
              label="Variant name"
              description="This will be used as the variant identifier in your code"
              placeholder="e.g., Control, Variant A"
              value={variant.name ?? ''}
              onChange={(e) => onFieldChange(index, 'name', e.currentTarget.value)}
              disabled={disabled}
              required
            />

            <Group grow gap="md" align="start">
              <Select
                label="Payload type"
                data={payloadTypeOptions}
                placeholder="Select type"
                value={variant.payloadType ?? null}
                onChange={(value) => onFieldChange(index, 'payloadType', value ?? '')}
                disabled={disabled}
                checkIconPosition="right"
              />
              <TextInput
                label="Payload"
                placeholder={
                  variant.payloadType === VariantPayloadType.JSON
                    ? '{"color": "blue"}'
                    : 'e.g., checkout_v2'
                }
                value={variant.payload ?? ''}
                onChange={(e) => onFieldChange(index, 'payload', e.currentTarget.value)}
                disabled={disabled}
              />
            </Group>

            <Textarea
              label="Description (Optional)"
              placeholder="Optional description"
              value={variant.description ?? ''}
              onChange={(e) => onFieldChange(index, 'description', e.currentTarget.value)}
              disabled={disabled}
              autosize
              minRows={1}
            />
          </Stack>
        )}

        <Group justify="space-between" align="flex-end">
          <NumberInput
            label="Weight (%)"
            value={localWeight}
            onChange={(val) => {
              const w = Number(val) || 0;
              setLocalWeight(w);
              debouncedWeightChange(w);
            }}
            min={0}
            max={100}
            clampBehavior="strict"
            suffix="%"
            disabled={disabled || !variant.isCustomWeight}
            style={{ width: 140 }}
          />
          <Switch
            label="Custom weight"
            checked={variant.isCustomWeight}
            onChange={(e) => onCustomWeightToggle(index, e.currentTarget.checked)}
            disabled={disabled}
            withThumbIndicator={false}
          />
        </Group>
      </Stack>
    </Paper>
  );
};
