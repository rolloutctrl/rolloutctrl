import { ActionIcon as MantineActionButton, HoverCard } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

type InfoTooltipProps = {
  children: React.ReactNode;
};

export const InfoTooltip = ({ children }: InfoTooltipProps) => {
  return (
    <HoverCard
      shadow="none"
      classNames={{
        dropdown: 'max-w-[300px]',
      }}
    >
      <HoverCard.Target>
        <MantineActionButton type="button" color="gray.6" variant="transparent" size="xs">
          <IconInfoCircle size={14} />
        </MantineActionButton>
      </HoverCard.Target>
      <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
    </HoverCard>
  );
};
