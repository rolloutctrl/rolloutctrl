import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import { Switch, type SwitchProps } from '@mantine/core';
import { useToggleFlagEnable } from '../lib/useToggleFlagEnable';

type ToggleFlagEnableProps = SwitchProps & {
  projectId: string;
  featureFlagEnvironment: FeatureFlagEnvironment;
};

export const ToggleFlagEnable = ({
  projectId,
  featureFlagEnvironment,
  disabled,
  ...restProps
}: ToggleFlagEnableProps) => {
  const { handleToggleFlagEnable, isPending } = useToggleFlagEnable(
    projectId,
    featureFlagEnvironment,
  );
  return (
    <Switch
      {...restProps}
      variant="light"
      checked={featureFlagEnvironment.enabled}
      onClick={(e) => e.stopPropagation()}
      onChange={handleToggleFlagEnable}
      disabled={isPending || disabled}
    />
  );
};
