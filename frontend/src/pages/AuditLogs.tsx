import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { AuditLogsView } from '@/widgets/AuditLogs/AuditLogsView';
import { Helmet } from 'react-helmet-async';

export const AuditLogsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.AUDIT_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Audit Logs</title>
      </Helmet>
      <AuditLogsView />
    </RequiredProjectPermissionsWrapper>
  );
};
