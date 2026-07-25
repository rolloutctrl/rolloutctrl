import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { EnvironmentsView } from '@/widgets/Environment/EnvironmentsView';
import { Helmet } from 'react-helmet-async';

export const EnvironmentsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={PermissionCode.ENV_READ}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Environments</title>
      </Helmet>
      <EnvironmentsView />
    </RequiredProjectPermissionsWrapper>
  );
};
