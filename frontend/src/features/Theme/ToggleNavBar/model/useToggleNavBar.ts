import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ToggleNavBarState = {
  collapsed: boolean;
  opened: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setOpened: (opened: boolean) => void;
};

export const useToggleNavBar = create<ToggleNavBarState>()(
  persist(
    (set) => ({
      collapsed: false,
      opened: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      toggleMobile: () => set((state) => ({ opened: !state.opened })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setOpened: (opened) => set({ opened }),
    }),
    { name: 'toggleNavBar' },
  ),
);
