import { FeatureFlagsTable } from '@/widgets/FeatureFlag/FeatureFlagsTable';

export const ActiveFeatureFlagsTab = () => {
  return <FeatureFlagsTable includeArchived={false} />;
};
