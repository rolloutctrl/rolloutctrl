import {
  ActionIcon as MantineActionButton,
  Badge,
  Menu,
  Table,
  Text,
  type MantineColorScheme,
  HoverCard,
  Group,
  Stack,
  Box,
} from '@mantine/core';
import dayjs from 'dayjs';
import type { Variant } from '@/entities/Variant';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import {
  IconDotsVertical,
  IconPencil,
  // IconTestPipe,
  IconTrash,
} from '@tabler/icons-react';

type VariantTableItemProps = {
  variant: Variant;
  onEditVariant: (variant: Variant) => void;
  onDeleteVariant: (variant: Variant) => void;
  colorScheme: MantineColorScheme;
};

export const VariantTableItem = ({
  variant,
  onDeleteVariant,
  onEditVariant,
  colorScheme,
}: VariantTableItemProps) => {
  return (
    <Table.Tr>
      <Table.Td>
        <div className="flex flex-row items-center gap-2 py-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: variant.colorTag }}
          />
          <Text
            fw={600}
            className="cursor-pointer"
            size="sm"
            onClick={() => onEditVariant(variant)}
          >
            {variant.name}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {variant.payloadType ?? '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {variant.payload ?? '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        {variant.strategyVariants.length > 0 ? (
          <HoverCard classNames={{ dropdown: '!w-full !max-w-[300px]' }}>
            <HoverCard.Target>
              <Badge
                size="sm"
                color="green"
                variant="light"
                tt="capitalize"
                // leftSection={<IconTestPipe size={14}  />}
              >
                In Use
              </Badge>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Stack gap="xs">
                {variant.strategyVariants.map((strategy) => (
                  <Group
                    key={strategy.id}
                    gap="xs"
                    justify="space-between"
                    align="center"
                  >
                    <Box>
                      <Text size="sm">
                        {strategy.strategy.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {
                          strategy.strategy.featureFlagEnvironment.environment
                            .name
                        }
                      </Text>
                    </Box>

                    <Badge size="sm" variant="light" color="blue">
                      {strategy.weight}%
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dimmed">
          {dayjs(variant.createdAt).format('DD MMM YYYY HH:mm')}
        </Text>
      </Table.Td>
      <RequiredProjectPermissionsWrapper
        permissions={PermissionCode.VARIANT_UPDATE}
      >
        <Table.Td className="text-center">
          <Menu shadow="none" width={120} position="bottom-end">
            <Menu.Target>
              <MantineActionButton
                variant={colorScheme === 'light' ? 'light' : 'subtle'}
                size="md"
                color="gray"
                aria-label="Variant actions"
              >
                <IconDotsVertical size={14} />
              </MantineActionButton>
            </Menu.Target>
            <Menu.Dropdown>
              <RequiredProjectPermissionsWrapper
                permissions={[PermissionCode.VARIANT_UPDATE]}
              >
                <Menu.Item
                  leftSection={<IconPencil size={14} />}
                  onClick={() => onEditVariant(variant)}
                >
                  Edit
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
              <RequiredProjectPermissionsWrapper
                permissions={PermissionCode.VARIANT_DELETE}
              >
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onDeleteVariant(variant)}
                >
                  Delete
                </Menu.Item>
              </RequiredProjectPermissionsWrapper>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </RequiredProjectPermissionsWrapper>
    </Table.Tr>
  );
};
