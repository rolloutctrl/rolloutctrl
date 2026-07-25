import type { FeatureFlag } from '@/entities/FeatureFlag';
import {
  useGetFlagMetrics,
  useGetFlagStrategyMetrics,
  useGetFlagVariantsMetrics,
} from '@/entities/Metrics';
import { BarChart, LineChart } from '@mantine/charts';
import {
  Box,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconActivity, IconEye } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

type TimelinePoint = {
  date: string;
  evaluations: number;
  enabled: number;
  disabled: number;
};

type EnvironmentMetric = {
  environmentId: string;
  environmentName: string;
  exposures: number;
};

type FlagMetricsResponse = {
  exposures: number;
  timeline: TimelinePoint[];
  byEnvironment: EnvironmentMetric[];
};

type StrategyMetric = {
  strategyId: string;
  strategyName: string | null;
  environment: string | null;
  matches: number;
};

type VariantMetric = {
  variantId: string;
  variantName: string;
  exposures: number;
};

type FeatureFlagMetricsTabProps = {
  featureFlag: FeatureFlag;
};

const VARIANT_COLORS = [
  'indigo.5',
  'cyan.5',
  'pink.5',
  'orange.5',
  'grape.5',
] as const;

const StatCard = ({
  label,
  value,
  color,
  icon,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  icon: ReactNode;
  loading?: boolean;
}) => {
  return (
    <Paper p="lg" withBorder radius="md">
      {loading ? (
        <Skeleton h={60} />
      ) : (
        <Group gap="md">
          <ThemeIcon size="xl" radius="md" variant="light" color={color}>
            {icon}
          </ThemeIcon>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {label}
            </Text>
            <Text size="xl" fw={700}>
              {value.toLocaleString()}
            </Text>
          </Box>
        </Group>
      )}
    </Paper>
  );
};

const EmptyState = ({ label }: { label: string }) => {
  return (
    <Box
      h={80}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text c="dimmed" size="sm">
        {label}
      </Text>
    </Box>
  );
};

export const FeatureFlagMetricsTab = ({
  featureFlag,
}: FeatureFlagMetricsTabProps) => {
  const { projectId } = useParams();
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);

  const environmentOptions = featureFlag.environments.map((env) => ({
    value: env.id,
    label: env.environment.name,
  }));

  const { data: metrics, isLoading: metricsLoading } = useGetFlagMetrics(
    featureFlag.id,
    projectId ?? undefined,
    selectedEnvId ?? undefined,
  ) as {
    data: FlagMetricsResponse | undefined;
    isLoading: boolean;
  };
  const { data: strategies, isLoading: strategiesLoading } =
    useGetFlagStrategyMetrics(
      featureFlag.id,
      projectId ?? undefined,
      selectedEnvId ?? undefined,
    ) as {
      data: StrategyMetric[] | undefined;
      isLoading: boolean;
    };
  const { data: variants, isLoading: variantsLoading } =
    useGetFlagVariantsMetrics(
      featureFlag.id,
      projectId ?? undefined,
      selectedEnvId ?? undefined,
    ) as {
      data: VariantMetric[] | undefined;
      isLoading: boolean;
    };

  const variantExposuresTotal =
    variants?.reduce((sum, v) => sum + v.exposures, 0) ?? 0;

  return (
    <Stack gap="md">
      <SimpleGrid cols={2} ta="left">
        <StatCard
          label="Flag Exposures"
          value={metrics?.exposures ?? 0}
          color="blue"
          icon={<IconActivity size={18} />}
          loading={metricsLoading}
        />
        <StatCard
          label="Variant Exposures"
          value={variantExposuresTotal}
          color="violet"
          icon={<IconEye size={18} />}
          loading={variantsLoading}
        />
      </SimpleGrid>

      <Paper p="lg" withBorder radius="md" ta="left">
        <Group gap="xs" justify="space-between" mb="md">
          <div className="flex flex-col">
            <Title order={5}>Trend Chart</Title>
            <Text size="sm" c="dimmed">
              Exposures over time
            </Text>
          </div>
          <Select
            placeholder="All environments"
            data={environmentOptions}
            value={selectedEnvId}
            onChange={(value) => setSelectedEnvId(value as string | null)}
            clearable
            checkIconPosition="right"
            size="xs"
            w={180}
          />
        </Group>

        {metricsLoading ? (
          <Skeleton h={250} />
        ) : metrics?.timeline?.length ? (
          <LineChart
            h={250}
            data={metrics.timeline}
            dataKey="date"
            series={[
              { name: 'exposures', label: 'Flag Exposures', color: 'teal.6' },
            ]}
            curveType="monotone"
          />
        ) : (
          <EmptyState label="No timeline data for the selected period" />
        )}
      </Paper>

      <Paper p="lg" withBorder radius="md">
        <Title order={5} mb="md">
          Distribution Chart
        </Title>
        <SimpleGrid cols={2}>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Strategies
            </Text>
            {strategiesLoading ? (
              <Skeleton h={200} />
            ) : strategies?.length ? (
              <BarChart
                h={200}
                data={strategies.map((s) => ({
                  name:
                    s.strategyName ?? `Strategy ${s.strategyId.slice(0, 8)}`,
                  matches: s.matches,
                }))}
                dataKey="name"
                series={[
                  { name: 'matches', label: 'Matches', color: 'violet.5' },
                ]}
                orientation="vertical"
              />
            ) : (
              <EmptyState label="No strategy data" />
            )}
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Variants
            </Text>
            {variantsLoading ? (
              <Skeleton h={200} />
            ) : variants?.length ? (
              <BarChart
                h={200}
                data={variants.map((v, i) => ({
                  name: v.variantName,
                  exposures: v.exposures,
                  color: VARIANT_COLORS[i % VARIANT_COLORS.length],
                }))}
                dataKey="name"
                series={[
                  { name: 'exposures', label: 'Exposures', color: 'indigo.5' },
                ]}
                orientation="vertical"
              />
            ) : (
              <EmptyState label="No variant data" />
            )}
          </Stack>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
};
