import { useDebouncedCallback } from '@mantine/hooks';
import type { Strategy } from '@/entities/Strategy';
import { useToggleStrategyEnableApi } from '../api/useToggleStrategyEnableApi';
import { useParams } from 'react-router-dom';

export const useToggleStrategyEnable = (strategy: Strategy) => {
  const { projectId } = useParams();
  const { mutateAsync, isPending } = useToggleStrategyEnableApi();

  const handleToggleStrategyEnable = useDebouncedCallback(async () => {
    await mutateAsync({
      strategyId: strategy.id,
      enabled: !strategy.enabled,
      projectId,
    });
  }, 500);

  return { handleToggleStrategyEnable, isPending };
};
