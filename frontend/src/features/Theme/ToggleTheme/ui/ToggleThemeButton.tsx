import {
  ActionIcon as MantineActionButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export const ToggleThemeButton = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <MantineActionButton
      onClick={() =>
        setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
      }
      variant={"subtle"}
      color="gray"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {colorScheme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
    </MantineActionButton>
  );
};
