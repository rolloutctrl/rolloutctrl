import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ToggleNavBarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useToggleNavBar = create<ToggleNavBarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    { name: 'toggleNavBar' },
  ),
);
