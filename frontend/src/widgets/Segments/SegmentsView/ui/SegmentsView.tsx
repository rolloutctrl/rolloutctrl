import { CreateSegmentButton } from '@/features/Segment/CreateSegment';
import { Paper, Grid, Title } from '@mantine/core';
import { SegmentsTable } from '../../SegmentsTable';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';

export const SegmentsView = () => {
  return (
    <Grid columns={24}>
      <Grid.Col span={24}>
        <Paper radius="md" p={0} withBorder>
          <div className="flex items-center justify-between p-4">
            <Title order={2} fw={600} size="xl" ta="left">
              Segments
            </Title>
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.SEGMENT_CREATE}
            >
              <CreateSegmentButton />
            </RequiredProjectPermissionsWrapper>
          </div>
          <SegmentsTable />
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
