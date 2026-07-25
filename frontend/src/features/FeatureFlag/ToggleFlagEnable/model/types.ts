export type ToggleFlagEnableParams = {
  flagId: string;
  projectId: string;
  environmentId: string;
  enabled: boolean;
};

export type ToggleFlagEnableBody = Pick<ToggleFlagEnableParams, 'enabled'>;
