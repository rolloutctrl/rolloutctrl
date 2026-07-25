import { ActionIcon as MantineActionButton, Tooltip } from '@mantine/core';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useToggleNavBar } from '../model/useToggleNavBar';

export const ToggleNavBar = () => {
  const { collapsed, toggle } = useToggleNavBar();

  return (
    <Tooltip label={collapsed ? 'Expand' : 'Collapse'} position="right">
      <MantineActionButton
        type="button"
        onClick={toggle}
        variant="subtle"
        color="gray"
        size="lg"
        aria-label="Toggle navbar"
      >
        {collapsed ? (
          <IconLayoutSidebarLeftExpand size={18}  />
        ) : (
          <IconLayoutSidebarLeftCollapse size={18}  />
        )}
      </MantineActionButton>
    </Tooltip>
  );
};
