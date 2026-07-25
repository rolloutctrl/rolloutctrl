import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { searchInProjectQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';

export type SearchResultItem =
  | {
      type: 'feature_flag';
      id: string;
      key: string;
      description: string;
      archived: boolean;
      createdAt: string;
    }
  | {
      type: 'action';
      id: string;
      key: string;
      description: string;
      enabled: boolean;
      createdAt: string;
    }
  | {
      type: 'segment';
      id: string;
      key: string;
      name: string;
      description: string;
      createdAt: string;
    }
  | {
      type: 'strategy';
      id: string;
      name: string;
      enabled: boolean;
      createdAt: string;
      featureFlagKey: string;
      environmentName: string;
    }
  | {
      type: 'variant';
      id: string;
      name: string;
      description: string;
      createdAt: string;
      featureFlagKey: string;
      environmentName: string;
    };

const searchInProject = async (projectId?: string | null, query?: string) => {
  const response = await apiClient.get<SearchResultItem[]>(
    apiRoutes.projects.search(projectId),
    { params: { q: query } },
  );
  return response.data;
};

export const useSearchInProjectApi = (
  projectId?: string | null,
  query?: string,
) =>
  useQuery({
    queryKey: [searchInProjectQueryKey, { projectId, query: query ?? '' }],
    queryFn: () => searchInProject(projectId, query),
    enabled: !!projectId && !!query && query.trim().length > 0,
  });
