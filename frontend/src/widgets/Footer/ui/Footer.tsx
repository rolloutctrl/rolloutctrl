import { Anchor, AppShell, Group, Text } from '@mantine/core';
import pkg from '../../../../package.json';

const DOCS_LINKS = [
  { label: 'Documentation', href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/README.md#documentation' },
  { label: 'API Reference', href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/docs/api.md' },
  { label: 'Changelog', href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/CHANGELOG.md' },
];

export const Footer = () => {
  return (
    <AppShell.Footer p="md">
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} RolloutCtrl · v{pkg.version}
        </Text>
        <Group gap="lg">
          {DOCS_LINKS.map((link) => (
            <Anchor key={link.label} href={link.href} size="sm" c="dimmed" target="_blank">
              {link.label}
            </Anchor>
          ))}
        </Group>
      </Group>
    </AppShell.Footer>
  );
};
