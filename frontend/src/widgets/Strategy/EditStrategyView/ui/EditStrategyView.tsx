import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { EditStrategyFormOnPage } from '@/features/Strategy/EditStrategy';
import { BackButton } from '@/shared/ui';
import {
  Center,
  Divider,
  Grid,
  Loader,
  Paper,
  Text,
  Title,
} from '@mantine/core';
import { useParams, useSearchParams } from 'react-router-dom';

export const EditStrategyView = () => {
  const { projectId, featureFlagId, strategyId } = useParams();
  const [searchParams] = useSearchParams();
  const envParam = searchParams.get('env');
  const envQuery = envParam ? `?env=${envParam}` : '';
  const { data: currentFlag, isLoading } = useGetFeatureFlagById(
    projectId,
    featureFlagId,
  );

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  return (
    <Grid columns={24}>
      <Grid.Col span={24} ta="left">
        <BackButton
          label="Back to Feature Flag"
          to={`/project/${projectId}/feature-flags/${featureFlagId}${envQuery}`}
        />
        <Paper
          p={0}
          radius="md"
          withBorder
          className="bg-white !dark:bg-transparent"
        >
          <Grid columns={12}>
            <Grid.Col span={12} pt="md" px="md">
              <Title order={2} fw={700} size="xl" ta="left" pb={4}>
                Edit strategy
              </Title>
              <Text size="sm" c="dimmed">
                Edit strategy #{strategyId} for <strong>{currentFlag?.key}</strong>
              </Text>
            </Grid.Col>
            <Grid.Col span={12} p={0}>
              <Divider my={0} />
            </Grid.Col>
            <Grid.Col span={8} p="md">
              <EditStrategyFormOnPage />
            </Grid.Col>
          </Grid>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
