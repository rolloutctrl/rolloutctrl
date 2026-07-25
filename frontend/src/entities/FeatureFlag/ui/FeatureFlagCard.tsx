import { Card, Grid, Switch, Text } from '@mantine/core';
import { type FeatureFlag } from '../model/types';
import { Link } from 'react-router-dom';

type FeatureFlagCardProps = {
  featureFlag: FeatureFlag;
};

export const FeatureFlagCard = ({ featureFlag }: FeatureFlagCardProps) => {
  return (
    <Card withBorder className="flex flex-row items-center w-full text-left">
      <Grid w="100%" justify="center" align="center">
        <Grid.Col span={8}>
          <Text
            component={Link}
            to={`/project/${featureFlag.projectId}/feature-flags/${featureFlag.id}`}
            fw={600}
          >
            {featureFlag.key}
          </Text>
          <Text size="sm" c="dimmed">
            {featureFlag.description}
          </Text>
        </Grid.Col>
        <Grid.Col span={2} align="center">
          <Switch
            withThumbIndicator={false}
            className="flex flex-row items-center justify-center"
          />
        </Grid.Col>
        <Grid.Col
          span={2}
          className="flex flex-row items-center justify-center"
        >
          <Switch withThumbIndicator={false} />
        </Grid.Col>
      </Grid>
    </Card>
  );
};
