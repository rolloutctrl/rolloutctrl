import { CreateSegmentButton } from "@/features/Segment/CreateSegment";
import { SegmentsTable } from "@/widgets/Segments/SegmentsTable";
import { Card, Title } from "@mantine/core";

export const SegmentsTab = () => {
  return (
    <Card radius="md" p={0}>
      <div className="flex items-center justify-between p-4">
        <Title order={2} fw={600} size="lg" ta="left">
          Segments
        </Title>
        <CreateSegmentButton />
      </div>
      <SegmentsTable />
    </Card>
  );
};
