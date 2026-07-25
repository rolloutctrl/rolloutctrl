import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { ActionsView } from '@/widgets/Action/ActionsView';
import { Helmet } from 'react-helmet-async';

export const ActionsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.ACTION_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Actions</title>
      </Helmet>
      <ActionsView />
    </RequiredProjectPermissionsWrapper>
  );
};
