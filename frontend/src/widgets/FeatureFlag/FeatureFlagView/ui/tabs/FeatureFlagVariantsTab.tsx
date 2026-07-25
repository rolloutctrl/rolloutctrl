import type { FeatureFlag } from '@/entities/FeatureFlag';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { CreateVariantButton } from '@/features/Variant/CreateVariant';
import { PermissionCode } from '@/shared/types/enums';
import { VariantsTable } from '@/widgets/Variants/VariantsTable';
import { Group, Paper, Title } from '@mantine/core';

type FeatureFlagVariantsTabProps = {
  featureFlag: FeatureFlag;
};

export const FeatureFlagVariantsTab = ({
  featureFlag,
}: FeatureFlagVariantsTabProps) => {
  return (
    <Paper p={0} withBorder radius="md" ta="left" className="!overflow-clip">
      <Group gap="xs" justify="space-between" p="md">
        <Title order={2} fw={700} size="xl" ta="left">
          Variants
        </Title>
        <RequiredProjectPermissionsWrapper
          permissions={PermissionCode.VARIANT_CREATE}
        >
          <CreateVariantButton />
        </RequiredProjectPermissionsWrapper>
      </Group>
      <VariantsTable flagId={featureFlag.id} />
    </Paper>
  );
};
