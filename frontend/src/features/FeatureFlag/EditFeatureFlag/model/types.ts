export type EditFeatureFlagFormState = {
  flagId: string;
  projectId: string;
  key: string;
  archived: boolean;
  description?: string;
};