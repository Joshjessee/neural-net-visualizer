import type { StateCreator } from 'zustand';

export interface DataFlowSlice {
  isFlowAnimating: boolean;
  flowActiveLayerIndex: number;
  flowActivations: Record<string, { values: number[]; shape: number[] }> | null;
  flowInputSample: number[] | null;
  flowInputShape: number[] | null;

  startFlowAnimation: (
    activations: Record<string, { values: number[]; shape: number[] }>,
    inputSample: number[],
    inputShape: number[],
  ) => void;
  advanceFlow: () => void;
  stopFlowAnimation: () => void;
}

export const createDataFlowSlice: StateCreator<DataFlowSlice, [], [], DataFlowSlice> = (set) => ({
  isFlowAnimating: false,
  flowActiveLayerIndex: -1,
  flowActivations: null,
  flowInputSample: null,
  flowInputShape: null,

  startFlowAnimation: (activations, inputSample, inputShape) =>
    set({
      isFlowAnimating: true,
      flowActiveLayerIndex: 0,
      flowActivations: activations,
      flowInputSample: inputSample,
      flowInputShape: inputShape,
    }),

  advanceFlow: () =>
    set(state => ({ flowActiveLayerIndex: state.flowActiveLayerIndex + 1 })),

  stopFlowAnimation: () =>
    set({ isFlowAnimating: false, flowActiveLayerIndex: -1 }),
});
