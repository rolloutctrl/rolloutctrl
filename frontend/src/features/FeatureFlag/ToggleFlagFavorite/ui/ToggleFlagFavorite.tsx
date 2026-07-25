import type { FeatureFlag } from '@/entities/FeatureFlag';
import { ActionIcon as MantineActionButton } from '@mantine/core';
import { IconStarFilled } from '@tabler/icons-react';
import { useToggleFlagFavorite } from '../lib/useToggleFlagFavorite';

type ToggleFlagFavoriteProps = {
  projectId: string;
  featureFlag: FeatureFlag;
};

export const ToggleFlagFavorite = ({
  projectId,
  featureFlag,
}: ToggleFlagFavoriteProps) => {
  const { handleToggleFlagFavorite, isPending } = useToggleFlagFavorite(
    projectId,
    featureFlag,
  );
  return (
    <MantineActionButton
      variant="transparent"
      size="xs"
      disabled={isPending}
      onClick={handleToggleFlagFavorite}
    >
      {featureFlag.isFavorite ? (
        <IconStarFilled color="#ffd43b" />
      ) : (
        <IconStarFilled className='text-gray-200 dark:text-gray-200/50'  />
      )}
    </MantineActionButton>
  );
};
