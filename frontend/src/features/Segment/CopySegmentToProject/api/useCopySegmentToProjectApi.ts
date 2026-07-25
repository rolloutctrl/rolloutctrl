import { apiClient } from "@/shared/api/apiClient";
import type { CopySegmentToProjectFormState } from "../model/types";
import { apiRoutes } from "@/shared/api/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

const copySegmentToProject = async (data: CopySegmentToProjectFormState) => {
  const response = await apiClient.post<{success: boolean}>(apiRoutes.segments.copyToProject, data);
  return response.data;
};

export const useCopySegmentToProjectApi = () => {
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CopySegmentToProjectFormState) => copySegmentToProject(data),
    onSuccess: () => {
      notifications.show({
        position: 'bottom-center',
        withCloseButton: true,
        allowClose: true,
        autoClose: 3000,
        title: 'Segment copied',
        message: 'The segment has been copied successfully',
        color: 'rollout'
      });
    },
  });

  return {
    mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};