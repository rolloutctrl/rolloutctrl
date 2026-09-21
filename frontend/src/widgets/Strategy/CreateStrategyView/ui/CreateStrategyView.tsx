import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { CreateStrategyFormOnPage } from '@/features/Strategy/CreateStrategy';
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

export const CreateStrategyView = () => {
  const { projectId, featureFlagId } = useParams();
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
    <Grid columns={12}>
      <Grid.Col span={12} ta="left">
        <BackButton
          label="Back to Feature flag"
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
                Create strategy
              </Title>
              <Text size="sm" c="dimmed">
                Create a new strategy for <strong>{currentFlag?.key}</strong>
              </Text>
            </Grid.Col>
            <Grid.Col span={12} p={0}>
              <Divider my={0} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 12, lg: 8 }} p="md">
              <CreateStrategyFormOnPage needRedirect />
            </Grid.Col>
            {/* <Grid.Col span={4}></Grid.Col> */}
          </Grid>

          <div className="flex flex-col w-full items-start p-4"></div>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
