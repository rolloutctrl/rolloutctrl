import { type FC } from 'react';
import { Group, Progress, Text } from '@mantine/core';
import type { AssignVariantItem } from '../model/types';
import { VARIANT_COLOR_NAMES, VARIANT_COLOR_HEX } from '../lib/consts';

type WeightDistributionBarProps = {
  variants: AssignVariantItem[];
};

export const WeightDistributionBar: FC<WeightDistributionBarProps> = ({
  variants,
}) => {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);

  const getDisplayName = (variant: AssignVariantItem, index: number) => {
    if (variant.variant?.name) return variant.variant.name;
    if (variant.name) return variant.name;
    return `Variant ${index + 1}`;
  };

  return (
    <div>
      <Group justify="space-between" mb={6}>
        <Text size="xs" c="dimmed" fw={500}>
          Weight distribution
        </Text>
        <Text
          size="xs"
          fw={600}
          c={totalWeight === 100 ? 'dimmed' : 'red'}
        >
          Total: {totalWeight}%
        </Text>
      </Group>
      <Progress.Root size="xl">
        {variants.map((variant, index) => {
          const colorName =
            VARIANT_COLOR_NAMES[index % VARIANT_COLOR_NAMES.length];
          const hex = variant.colorTag ?? variant.variant?.colorTag ?? VARIANT_COLOR_HEX[colorName];
          return (
            <Progress.Section
              key={index}
              value={variant.weight}
              color={hex}
            >
              {variant.weight >= 8 && (
                <Progress.Label>
                  {getDisplayName(variant, index)}
                </Progress.Label>
              )}
            </Progress.Section>
          );
        })}
      </Progress.Root>
      <Group gap="xs" mt={8} wrap="wrap">
        {variants.map((variant, index) => {
          const colorName =
            VARIANT_COLOR_NAMES[index % VARIANT_COLOR_NAMES.length];
          const hex = variant.colorTag ?? variant.variant?.colorTag ?? VARIANT_COLOR_HEX[colorName];
          return (
            <Group key={index} gap={4}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: hex,
                  flexShrink: 0,
                }}
              />
              <Text size="xs" c="dimmed">
                {getDisplayName(variant, index)}: {variant.weight}%
              </Text>
            </Group>
          );
        })}
      </Group>
    </div>
  );
};
