import { apiClient } from '@/shared/api/apiClient';
import { apiRoutes } from '@/shared/api/apiRoutes';
import { getSegmentByIdQueryKey } from '@/shared/constants/consts';
import { useQuery } from '@tanstack/react-query';
import type { Segment } from '../model/types';
import type { Nullable } from '@/shared/types/types';

const fetchSegmentById = async (segmentId?: Nullable<string>) => {
  const response = await apiClient.get<Segment>(
    apiRoutes.segments.segment(segmentId),
  );
  return response.data;
};

export const useGetSegmentById = (
  segmentId?: Nullable<string>,
  projectId?: Nullable<string>,
) =>
  useQuery({
    queryKey: [getSegmentByIdQueryKey, { segmentId, projectId }],
    queryFn: () => fetchSegmentById(segmentId),
    enabled: !!segmentId && !!projectId,
  });
