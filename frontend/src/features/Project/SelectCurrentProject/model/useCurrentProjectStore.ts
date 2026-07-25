import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CurrentProjectStoreState,
  CurrentProjectStoreActions,
} from './types';

const initialState: CurrentProjectStoreState = {
  selectedProjectId: null,
};

export const useCurrentProjectStore = create<
  CurrentProjectStoreState & CurrentProjectStoreActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedProjectId: (projectId) =>
        set((state) => ({
          ...state,
          selectedProjectId: projectId,
        })),
      clearState: () =>
        set({
          ...initialState,
        }),
    }),
    { name: 'currentProject' },
  ),
);

export const setSelectedProjectId = (value: string) => useCurrentProjectStore.getState().setSelectedProjectId(value);
export const clearCurrentProject = () =>
  useCurrentProjectStore.getState().clearState();
