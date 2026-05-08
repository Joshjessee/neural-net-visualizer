import type { StateCreator } from 'zustand';
import type { ViewMode } from '../../types/ui';

export interface ViewSlice {
  viewMode: ViewMode;
  selectedLayerId: string | null;
  expandedLayerId: string | null;

  setViewMode: (mode: ViewMode) => void;
  selectLayer: (layerId: string | null) => void;
  toggleLayerExpand: (layerId: string) => void;
}

export const createViewSlice: StateCreator<ViewSlice, [], [], ViewSlice> = (set) => ({
  viewMode: '2d',
  selectedLayerId: null,
  expandedLayerId: null,

  setViewMode: (mode) => set({ viewMode: mode }),

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  toggleLayerExpand: (layerId) =>
    set(state => ({
      expandedLayerId: state.expandedLayerId === layerId ? null : layerId,
    })),
});
