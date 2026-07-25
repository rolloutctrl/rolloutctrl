import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { EditStrategyView } from '@/widgets/Strategy/EditStrategyView';
import { Helmet } from 'react-helmet-async';

export const EditFeatureFlagStrategyPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={PermissionCode.FLAG_STRATEGY_UPDATE}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Edit Feature Flag Strategy</title>
      </Helmet>
      <EditStrategyView />
    </RequiredProjectPermissionsWrapper>
  );
};
