import { Badge, Group, Input } from '@mantine/core';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { IconHelp, IconHome, IconSearch } from '@tabler/icons-react';
import { useSearchInProjectSpotlight } from '../lib/useSearchInProjectSpotlight';
import type { SpotlightActionData } from '@mantine/spotlight';
import { useNavigate } from 'react-router-dom';

export const SearchInProjectSpotlight = () => {
  const navigate = useNavigate();
  const { search, setSearch, actions, isFetching } =
    useSearchInProjectSpotlight();

  const defaultActions: SpotlightActionData[] = [
    {
      id: 'home',
      label: 'Home',
      description: 'Get to home page',
      onClick: () => navigate('/'),
      leftSection: <IconHome size={24} />,
    },
    {
      id: 'documentation',
      label: 'Documentation',
      description: 'Visit documentation to lean more about all features',
      onClick: () =>
        navigate(
          'https://github.com/rolloutctrl/rolloutctrl/blob/main/README.md#documentation',
        ),
      leftSection: <IconHelp size={24} />,
    },
  ];

  return (
    <>
      <Input
        component="button"
        type="button"
        onClick={spotlight.open}
        pointer
        w={260}
      >
        <Group gap="xs" justify="space-between">
          <Group>
            <IconSearch size={16} className="text-gray-400" />
            <Input.Placeholder>Search in project...</Input.Placeholder>
          </Group>

          <Badge
            variant="light"
            color="gray"
            radius="sm"
            size="sm"
            tt="capitalize"
            className="dark:!bg-dark"
          >
            Ctrl + K
          </Badge>
        </Group>
      </Input>
      <Spotlight
        actions={!search.length ? defaultActions : actions}
        nothingFound={isFetching ? 'Searching...' : 'Nothing found...'}
        highlightQuery
        shortcut="ctrl + K"
        searchProps={{
          leftSection: <IconSearch size={20} />,
          placeholder: 'Search in project...',
          value: search,
          onChange: (e) => setSearch(e.target.value),
        }}
      />
    </>
  );
};
