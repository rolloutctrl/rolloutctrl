import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import type { SpotlightActionData } from '@mantine/spotlight';
import { IconBolt, IconChartPie, IconFlag, IconTarget, IconTestPipe } from '@tabler/icons-react';
import { useCurrentProjectStore } from '@/features/Project/SelectCurrentProject/model/useCurrentProjectStore';
import { navigationRoutes } from '@/shared/routes/navigationRoutes';
import { useSearchInProjectApi } from '../api/useSearchInProjectApi';

export const useSearchInProjectSpotlight = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const { selectedProjectId } = useCurrentProjectStore();
  const navigate = useNavigate();

  const { data: results = [], isFetching } = useSearchInProjectApi(
    selectedProjectId,
    debouncedSearch,
  );

  const actions: SpotlightActionData[] = results.map((item) => {
    switch (item.type) {
      case 'feature_flag':
        return {
          id: `feature_flag-${item.id}`,
          label: item.key,
          description: `${item.description ?? ''} · ID: ${item.id}`,
          leftSection: <IconFlag size={20} />,
          onClick: () => navigate(navigationRoutes.featureFlag(selectedProjectId!, item.key)),
        };
      case 'action':
        return {
          id: `action-${item.id}`,
          label: item.key,
          description: `${item.description ?? ''} · ID: ${item.id}`,
          leftSection: <IconBolt size={20} />,
          onClick: () => navigate(navigationRoutes.action(selectedProjectId!, item.key)),
        };
      case 'segment':
        return {
          id: `segment-${item.id}`,
          label: item.name ?? item.key,
          description: `${item.description ?? ''} · ID: ${item.id}`,
          leftSection: <IconTarget size={20} />,
          onClick: () => navigate(navigationRoutes.segments(selectedProjectId!)),
        };
      case 'strategy':
        return {
          id: `strategy-${item.id}`,
          label: item.name,
          description: `${item.featureFlagKey} · ${item.environmentName} · ID: ${item.id}`,
          leftSection: <IconChartPie size={20} />,
          onClick: () => navigate(navigationRoutes.featureFlags(selectedProjectId!)),
        };
      case 'variant':
        return {
          id: `variant-${item.id}`,
          label: item.name,
          description: `${item.featureFlagKey} · ${item.environmentName} · ID: ${item.id}`,
          leftSection: <IconTestPipe size={20} />,
          onClick: () => navigate(navigationRoutes.featureFlagVariants(selectedProjectId!, item.featureFlagKey, 'variants')),
        };
    }
  });

  return {
    search,
    setSearch,
    actions,
    isFetching,
  };
};