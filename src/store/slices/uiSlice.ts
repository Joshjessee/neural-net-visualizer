import type { StateCreator } from 'zustand';
import type { SidebarPanel } from '../../types/ui';

export type ExperienceMode = 'beginner' | 'advanced';

export interface UiSlice {
  sidebarOpen: boolean;
  activePanel: SidebarPanel;
  showActivations: boolean;
  experienceMode: ExperienceMode;

  toggleSidebar: () => void;
  setActivePanel: (panel: SidebarPanel) => void;
  setShowActivations: (show: boolean) => void;
  setExperienceMode: (mode: ExperienceMode) => void;
}

const savedMode = localStorage.getItem('ml-visual-experience-mode') as ExperienceMode | null;

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  sidebarOpen: true,
  activePanel: 'layers',
  showActivations: true,
  experienceMode: savedMode === 'advanced' ? 'advanced' : 'beginner',

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setShowActivations: (show) => set({ showActivations: show }),
  setExperienceMode: (mode) => set({ experienceMode: mode }),
});
