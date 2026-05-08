import type { StateCreator } from 'zustand';
import type { SidebarPanel } from '../../types/ui';

export interface UiSlice {
  sidebarOpen: boolean;
  activePanel: SidebarPanel;
  showActivations: boolean;

  toggleSidebar: () => void;
  setActivePanel: (panel: SidebarPanel) => void;
  setShowActivations: (show: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  sidebarOpen: true,
  activePanel: 'layers',
  showActivations: true,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setShowActivations: (show) => set({ showActivations: show }),
});
