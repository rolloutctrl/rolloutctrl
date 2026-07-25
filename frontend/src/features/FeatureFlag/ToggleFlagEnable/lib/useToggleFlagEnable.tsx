import type { FeatureFlagEnvironment } from "@/entities/FeatureFlagEnvironment";
import { useToggleFlagEnableApi } from "../api/useToggleFlagEnableApi"
import { useDebouncedCallback } from "@mantine/hooks";
import type { ToggleFlagEnableParams } from "../model/types";

export const useToggleFlagEnable = (projectId: string, featureFlagEnvironment: FeatureFlagEnvironment) => {
  const { mutateAsync, isPending } = useToggleFlagEnableApi();

  const handleToggleFlagEnable = useDebouncedCallback(async () => {
    const state: ToggleFlagEnableParams = {
      projectId: projectId,
      flagId: featureFlagEnvironment.featureFlagId,
      environmentId: featureFlagEnvironment.environmentId,
      enabled: !featureFlagEnvironment.enabled,
    };
    await mutateAsync(state);
  }, 500);

  return {
    handleToggleFlagEnable,
    isPending,
  };
}