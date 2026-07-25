import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { FeatureFlagsView } from '@/widgets/FeatureFlag/FeatureFlagsView';
import { Helmet } from 'react-helmet-async';

export const FeatureFlagsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.FLAG_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Feature Flags</title>
      </Helmet>
      <FeatureFlagsView />
    </RequiredProjectPermissionsWrapper>
  );
};
