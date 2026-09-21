import { ActionIcon as MantineActionButton, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useToggleNavBar } from '../model/useToggleNavBar';

export const ToggleNavBar = () => {
  const { collapsed, opened, toggle, toggleMobile } = useToggleNavBar();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleToggle = () => {
    if (isMobile) {
      toggleMobile();
    } else {
      toggle();
    }
  };

  const isExpanded = isMobile ? opened : !collapsed;

  return (
    <Tooltip label={isExpanded ? 'Collapse' : 'Expand'} position="right">
      <MantineActionButton
        type="button"
        onClick={handleToggle}
        variant="subtle"
        color="gray"
        size="lg"
        aria-label="Toggle navbar"
      >
        {isExpanded ? (
          <IconLayoutSidebarLeftCollapse size={18}  />
        ) : (
          <IconLayoutSidebarLeftExpand size={18}  />
        )}
      </MantineActionButton>
    </Tooltip>
  );
};
