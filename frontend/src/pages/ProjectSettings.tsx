import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { ProjectSettingsView } from '@/widgets/Project/ProjectSettingsView';
import { Helmet } from 'react-helmet-async';

export const ProjectSettingsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.PROJECT_UPDATE]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Project Settings</title>
      </Helmet>
      <ProjectSettingsView />
    </RequiredProjectPermissionsWrapper>
  );
};
