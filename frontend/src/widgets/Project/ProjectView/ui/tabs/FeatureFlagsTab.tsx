import { CreateFeatureFlagButton } from "@/features/FeatureFlag/CreateFeatureFlag";
import { FeatureFlagsTable } from "@/widgets/FeatureFlag/FeatureFlagsTable";
import { Card, Title } from "@mantine/core";

export const FeatureFlagsTab = () => {
  return (
    <Card radius="md" p={0}>
      <div className="flex items-center justify-between p-4">
        <Title order={2} fw={600} size="lg" ta="left">
          Feature Flags
        </Title>
        <CreateFeatureFlagButton />
      </div>
      <FeatureFlagsTable />
    </Card>
  );
};
