import { type FC, useMemo } from 'react';
import { Button, Group, Select, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Variant } from '@/entities/Variant';
import { MAX_VARIANTS } from '../lib/consts';

type AddVariantControlProps = {
  existingVariants: Variant[];
  currentVariantIds: string[];
  currentCount: number;
  disabled?: boolean;
  onSelectExisting: (variantId: string) => void;
  onCreateNew: () => void;
};

export const AddVariantControl: FC<AddVariantControlProps> = ({
  existingVariants,
  currentVariantIds,
  currentCount,
  disabled,
  onSelectExisting,
  onCreateNew,
}) => {
  const availableOptions = useMemo(
    () =>
      existingVariants
        .filter((v) => !currentVariantIds.includes(v.id))
        .map((v) => ({ value: v.id, label: v.name })),
    [existingVariants, currentVariantIds],
  );

  const maxReached = currentCount >= MAX_VARIANTS;

  if (maxReached) {
    return (
      <Text size="xs" c="dimmed" ta="center">
        Maximum {MAX_VARIANTS} variants per strategy
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Group gap="sm" align="flex-end">
        <Select
          label="Add existing variant"
          placeholder="Select a variant"
          data={availableOptions}
          disabled={disabled || availableOptions.length === 0}
          onChange={(value) => {
            if (value) onSelectExisting(value);
          }}
          checkIconPosition="right"
          searchable
          nothingFoundMessage="No available variants"
          style={{ flex: 1 }}
        />
        <Button
          variant="outline"
          leftSection={<IconPlus size={16} />}
          onClick={onCreateNew}
          disabled={disabled}
        >
          Create new
        </Button>
      </Group>
    </Stack>
  );
};
