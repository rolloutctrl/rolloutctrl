import { useToggleFlagFavoriteApi } from "../api/useToggleFlagFavoriteApi"
import { useDebouncedCallback } from "@mantine/hooks";
import type { ToggleFlagFavoriteParams } from "../model/types";
import type { FeatureFlag } from "@/entities/FeatureFlag";

export const useToggleFlagFavorite = (projectId: string, featureFlag: FeatureFlag) => {
  const { mutateAsync, isPending } = useToggleFlagFavoriteApi(false);

  const handleToggleFlagFavorite = useDebouncedCallback(async () => {
    const state: ToggleFlagFavoriteParams = {
      projectId: projectId,
      flagId: featureFlag.id,
      enabled: !featureFlag.isFavorite,
    };
    await mutateAsync(state);
  }, 500);

  return {
    handleToggleFlagFavorite,
    isPending,
  };
}