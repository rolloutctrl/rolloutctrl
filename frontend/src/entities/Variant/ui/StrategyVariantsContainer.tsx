import { Card, Grid, Group, Progress, Text } from '@mantine/core';
import type { StrategyVariant } from '../model/types';

type StrategyVariantsContainerProps = {
  strategyVariants: StrategyVariant[];
};

const StrategyVariantItem = ({ variant }: { variant: StrategyVariant }) => {
  return (
    <Card radius="md" p="md" withBorder>
      <Group justify="space-between" align="center" gap="xs">
        <div className="flex flex-row items-center gap-x-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: variant.variant.colorTag }}
          />
          <Text size="sm" ta="left" fw={600} lineClamp={1}>
            {variant.variant.name}
          </Text>
        </div>
        <Text size="sm" ta="right" fw={500}>
          {variant.weight}%
        </Text>
      </Group>
      <Progress
        value={variant.weight}
        size="sm"
        mt="xs"
        color={variant.variant.colorTag}
      />
    </Card>
  );
};

export const StrategyVariantsContainer = ({
  strategyVariants,
}: StrategyVariantsContainerProps) => {
  if (!strategyVariants.length) {
    return null;
  }
  return (
    <div className="flex flex-col w-full">
      <Group justify="space-between" align="center">
        <Text size="xs" fw={500} c="dimmed" mb="xs">
          Variants
        </Text>
      </Group>

      <Grid columns={12} >
        {strategyVariants.map((variant) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={variant.id}>
            <StrategyVariantItem variant={variant} />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};
