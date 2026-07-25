import type { Nullable } from "@/shared/types/types"

export type CurrentProjectStoreState = {
  selectedProjectId: Nullable<string>;
}

export type CurrentProjectStoreActions = {
  setSelectedProjectId: (projectId: string) => void;
  clearState: () => void;
}