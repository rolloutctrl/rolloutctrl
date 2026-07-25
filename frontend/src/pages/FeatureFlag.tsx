import { useGetFeatureFlagById } from '@/entities/FeatureFlag';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { FeatureFlagView } from '@/widgets/FeatureFlag/FeatureFlagView';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

export const FeatureFlagPage = () => {
  const { projectId, featureFlagId } = useParams();
  const { data: featureFlag } = useGetFeatureFlagById(projectId, featureFlagId);
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.FLAG_READ]}
      redirect
    >
      {featureFlag && (
        <Helmet>
          <title>{`RolloutCtrl - Feature Flag - ${String(featureFlag.key)}`}</title>
        </Helmet>
      )}
      <FeatureFlagView />
    </RequiredProjectPermissionsWrapper>
  );
};
