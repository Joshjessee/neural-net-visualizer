import { create } from 'zustand';
import { temporal } from 'zundo';
import type { NetworkSlice } from './slices/networkSlice';
import type { ViewSlice } from './slices/viewSlice';
import type { InferenceSlice } from './slices/inferenceSlice';
import type { UiSlice } from './slices/uiSlice';
import type { TrainingSlice } from './slices/trainingSlice';
import type { DataFlowSlice } from './slices/dataFlowSlice';
import { createNetworkSlice } from './slices/networkSlice';
import { createViewSlice } from './slices/viewSlice';
import { createInferenceSlice } from './slices/inferenceSlice';
import { createUiSlice } from './slices/uiSlice';
import { createTrainingSlice } from './slices/trainingSlice';
import { createDataFlowSlice } from './slices/dataFlowSlice';
import { loadFromLocalStorage, debouncedSave } from '../utils/persistence';

export type AppStore = NetworkSlice & ViewSlice & InferenceSlice & UiSlice & TrainingSlice & DataFlowSlice;

// Partialize: only track network-related state for undo/redo
type TrackedState = Pick<AppStore, 'layers' | 'connections' | 'modelType' | 'networkName' | 'presetId'>;

export const useStore = create<AppStore>()(
  temporal(
    (...a) => ({
      ...createNetworkSlice(...a),
      ...createViewSlice(...a),
      ...createInferenceSlice(...a),
      ...createUiSlice(...a),
      ...createTrainingSlice(...a),
      ...createDataFlowSlice(...a),
    }),
    {
      partialize: (state): TrackedState => ({
        layers: state.layers,
        connections: state.connections,
        modelType: state.modelType,
        networkName: state.networkName,
        presetId: state.presetId,
      }),
      limit: 50,
      equality: (pastState, currentState) =>
        JSON.stringify(pastState) === JSON.stringify(currentState),
    },
  ),
);

// Hydrate from localStorage on startup
const saved = loadFromLocalStorage();
if (saved) {
  useStore.getState().loadNetwork(
    saved.layers,
    saved.connections,
    saved.modelType,
    saved.networkName,
    saved.presetId ?? undefined,
  );
}

// Auto-save network state to localStorage (debounced)
useStore.subscribe((state, prevState) => {
  // Only save when network-related state changes
  if (
    state.layers !== prevState.layers ||
    state.connections !== prevState.connections ||
    state.modelType !== prevState.modelType ||
    state.networkName !== prevState.networkName ||
    state.presetId !== prevState.presetId
  ) {
    debouncedSave({
      layers: state.layers,
      connections: state.connections,
      modelType: state.modelType,
      networkName: state.networkName,
      presetId: state.presetId,
    });
  }

  // Persist experience mode preference
  if (state.experienceMode !== prevState.experienceMode) {
    localStorage.setItem('ml-visual-experience-mode', state.experienceMode);
  }
});
