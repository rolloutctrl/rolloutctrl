import type { Strategy } from '@/entities/Strategy';
import { Switch, type SwitchProps } from '@mantine/core';
import { useToggleStrategyEnable } from '../lib/useToggleStrategyEnable';

type ToggleStrategyEnableProps = SwitchProps & {
  strategy: Strategy;
};

export const ToggleStrategyEnable = ({
  strategy,
  disabled,
  ...restProps
}: ToggleStrategyEnableProps) => {
  const { handleToggleStrategyEnable, isPending } = useToggleStrategyEnable(strategy);

  return (
    <Switch
      {...restProps}
      variant="light"
      checked={strategy.enabled}
      onClick={(e) => e.stopPropagation()}
      onChange={handleToggleStrategyEnable}
      disabled={isPending || disabled}
    />
  );
};
