import { FeatureFlagsTable } from '@/widgets/FeatureFlag/FeatureFlagsTable';

type ArchivedFeatureFlagsTabProps = {
  includeArchived: boolean;
};

export const ArchivedFeatureFlagsTab = ({ includeArchived }: ArchivedFeatureFlagsTabProps) => {
  return <FeatureFlagsTable includeArchived={includeArchived} />;
};
