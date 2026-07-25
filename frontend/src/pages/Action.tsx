import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { ActionView } from '@/widgets/Action/ActionView';
import { Helmet } from 'react-helmet-async';

export const ActionPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.ACTION_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Action</title>
      </Helmet>
      <ActionView />
    </RequiredProjectPermissionsWrapper>
  );
};
