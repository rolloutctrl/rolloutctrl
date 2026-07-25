import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { CreateStrategyView } from '@/widgets/Strategy/CreateStrategyView/ui/CreateStrategyView';
import { Helmet } from 'react-helmet-async';
import { PermissionCode } from '@/shared/types/enums';

export const CreateFeatureFlagStrategyPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={PermissionCode.FLAG_STRATEGY_CREATE}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Create Feature Flag Strategy</title>
      </Helmet>
      <CreateStrategyView />
    </RequiredProjectPermissionsWrapper>
  );
};
