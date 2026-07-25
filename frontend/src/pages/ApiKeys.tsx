import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { ApiKeysView } from '@/widgets/ApiKey/ApiKeysView';
import { Helmet } from 'react-helmet-async';

export const ApiKeysPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.API_KEY_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - API Keys</title>
      </Helmet>
      <ApiKeysView />
    </RequiredProjectPermissionsWrapper>
  );
};
