import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import { SegmentsView } from '@/widgets/Segments/SegmentsView';

import { Helmet } from 'react-helmet-async';

export const SegmentsPage = () => {
  return (
    <RequiredProjectPermissionsWrapper
      permissions={[PermissionCode.SEGMENT_READ]}
      redirect
    >
      <Helmet>
        <title>RolloutCtrl - Segments</title>
      </Helmet>
      <SegmentsView />
    </RequiredProjectPermissionsWrapper>
  );
};
