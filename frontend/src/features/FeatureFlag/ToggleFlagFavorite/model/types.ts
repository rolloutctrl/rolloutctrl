export type ToggleFlagFavoriteParams = {
  flagId: string;
  projectId: string;
  enabled: boolean;
};

export type ToggleFlagFavoriteBody = Pick<ToggleFlagFavoriteParams, 'enabled'>;
