import { Anchor, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconRobot, IconArrowRight } from '@tabler/icons-react';

const MCP_GUIDE_URL =
  'https://github.com/rolloutctrl/rolloutctrl/blob/main/docs/MCP_GUIDE.md';

export const McpSetupGuide = () => {
  return (
    <Paper radius="md" p="md" withBorder className="!overflow-clip">
      <div className="flex items-start gap-3 text-left">
        <ThemeIcon
          variant="light"
          color="rollout"
          size="md"
          radius="md"
          className="mt-1 shrink-0"
        >
          <IconRobot size={20} />
        </ThemeIcon>
        <div className="flex flex-col gap-1">
          <Text fw={600} size="sm" ta="left">
            Connect an AI agent
          </Text>
          <Text size="sm" c="dimmed" ta="left">
            Connect Cursor, Claude Code or another MCP-compatible client to
            manage feature flags using natural language.
          </Text>
          <Anchor
            size="sm"
            href={MCP_GUIDE_URL}
            target="_blank"
            ta="left"
            className="mt-1 self-start"
          >
            <Group gap={4} align="center">
              MCP setup guide
              <IconArrowRight size={14} />
            </Group>
          </Anchor>
        </div>
      </div>
    </Paper>
  );
};
