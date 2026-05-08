import type { StateCreator } from 'zustand';
import type { DatasetId } from '../../types/inference';

export interface InferenceSlice {
  isModelBuilt: boolean;
  buildError: string | null;
  activations: Record<string, { values: number[]; shape: number[] }>;
  datasetId: DatasetId | null;
  isRunningInference: boolean;
  inferenceResult: number[] | null;

  setModelBuilt: (built: boolean) => void;
  setBuildError: (error: string | null) => void;
  setActivations: (activations: Record<string, { values: number[]; shape: number[] }>) => void;
  setDatasetId: (id: DatasetId | null) => void;
  setRunningInference: (running: boolean) => void;
  setInferenceResult: (result: number[] | null) => void;
  clearInference: () => void;
}

export const createInferenceSlice: StateCreator<InferenceSlice, [], [], InferenceSlice> = (set) => ({
  isModelBuilt: false,
  buildError: null,
  activations: {},
  datasetId: null,
  isRunningInference: false,
  inferenceResult: null,

  setModelBuilt: (built) => set({ isModelBuilt: built }),
  setBuildError: (error) => set({ buildError: error }),
  setActivations: (activations) => set({ activations }),
  setDatasetId: (id) => set({ datasetId: id }),
  setRunningInference: (running) => set({ isRunningInference: running }),
  setInferenceResult: (result) => set({ inferenceResult: result }),
  clearInference: () => set({
    isModelBuilt: false,
    buildError: null,
    activations: {},
    isRunningInference: false,
    inferenceResult: null,
  }),
});
