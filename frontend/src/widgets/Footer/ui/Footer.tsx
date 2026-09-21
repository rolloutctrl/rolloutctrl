import { Anchor, AppShell, Grid, Group, Text } from '@mantine/core';
import pkg from '../../../../package.json';
import { useMediaQuery } from '@mantine/hooks';

const DOCS_LINKS = [
  {
    label: 'Documentation',
    href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/README.md#documentation',
  },
  {
    label: 'API Reference',
    href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/docs/api.md',
  },
  {
    label: 'Changelog',
    href: 'https://github.com/rolloutctrl/rolloutctrl/blob/main/CHANGELOG.md',
  },
];

export const Footer = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <AppShell.Footer p="md">
      <Grid columns={12}>
        <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} RolloutCtrl · v{pkg.version}
          </Text>
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, md: 12, lg: 6 }}
          ta="left"
        >
          <Group gap="lg" justify={isMobile ? 'flex-start' : 'flex-end'}>
            {DOCS_LINKS.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                size="sm"
                c="dimmed"
                target="_blank"
              >
                {link.label}
              </Anchor>
            ))}
          </Group>
        </Grid.Col>
      </Grid>
      {/* <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} RolloutCtrl · v{pkg.version}
        </Text>
        <Group gap="lg">
          {DOCS_LINKS.map((link) => (
            <Anchor
              key={link.label}
              href={link.href}
              size="sm"
              c="dimmed"
              target="_blank"
            >
              {link.label}
            </Anchor>
          ))}
        </Group>
      </Group> */}
    </AppShell.Footer>
  );
};
