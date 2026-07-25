import { apiClient } from "@/shared/api/apiClient";
import { apiRoutes } from "@/shared/api/apiRoutes";
import { getFeatureFlagsByProjectIdQueryKey } from "@/shared/constants/consts";
import { useFeatureFlagsTabs } from "@/widgets/FeatureFlag/FeatureFlagsView";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const deleteFeatureFlag = async (flagId: string, projectId: string) => {
  const response = await apiClient.delete(apiRoutes.featureFlags.delete(flagId, projectId));
  return response.data;
};

export const useDeleteFeatureFlagApi = (flagKey: string, projectId: string, needRedirect?: boolean) => {
  const queryClient = useQueryClient();
  const { isArchiveTab } = useFeatureFlagsTabs();
  const navigate = useNavigate();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (flagId: string) => deleteFeatureFlag(flagId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          getFeatureFlagsByProjectIdQueryKey,
          { projectId, includeArchived: isArchiveTab },
        ],
        type: "all",
      });
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Feature flag deleted',
        message: `Feature flag ${flagKey} has been deleted successfully`,
        color: 'rollout'
      });
      if (needRedirect) {
        navigate(`/project/${projectId}/feature-flags`);
      }
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
}