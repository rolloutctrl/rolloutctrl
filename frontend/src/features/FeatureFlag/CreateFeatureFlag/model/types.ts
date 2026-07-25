export type CreateFeatureFlagFormState = {
  type: string;
  projectId: string;
  key: string;
  description?: string;
  flags?: string;
};

export type CreateFeatureFlagBody = {
  type: 'single' | 'multiple';
  projectId: string;
  key?: string;
  description?: string;
  flags?: { key: string; description?: string }[];
};