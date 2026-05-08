import type { StateCreator } from 'zustand';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  datasetId: 'mnist' | 'regression';
}

export interface TrainingSlice {
  isTraining: boolean;
  trainingEpoch: number;
  trainingTotalEpochs: number;
  lossHistory: number[];
  accuracyHistory: number[];
  currentLoss: number | null;
  currentAccuracy: number | null;
  trainingConfig: TrainingConfig;

  setTraining: (training: boolean) => void;
  setTrainingProgress: (epoch: number, totalEpochs: number) => void;
  appendLoss: (loss: number) => void;
  appendAccuracy: (accuracy: number) => void;
  setCurrentLoss: (loss: number | null) => void;
  setCurrentAccuracy: (accuracy: number | null) => void;
  setTrainingConfig: (config: Partial<TrainingConfig>) => void;
  resetTraining: () => void;
}

const DEFAULT_CONFIG: TrainingConfig = {
  epochs: 10,
  batchSize: 32,
  learningRate: 0.001,
  datasetId: 'mnist',
};

export const createTrainingSlice: StateCreator<TrainingSlice, [], [], TrainingSlice> = (set) => ({
  isTraining: false,
  trainingEpoch: 0,
  trainingTotalEpochs: 0,
  lossHistory: [],
  accuracyHistory: [],
  currentLoss: null,
  currentAccuracy: null,
  trainingConfig: { ...DEFAULT_CONFIG },

  setTraining: (training) => set({ isTraining: training }),

  setTrainingProgress: (epoch, totalEpochs) =>
    set({ trainingEpoch: epoch, trainingTotalEpochs: totalEpochs }),

  appendLoss: (loss) =>
    set(state => ({ lossHistory: [...state.lossHistory, loss], currentLoss: loss })),

  appendAccuracy: (accuracy) =>
    set(state => ({ accuracyHistory: [...state.accuracyHistory, accuracy], currentAccuracy: accuracy })),

  setCurrentLoss: (loss) => set({ currentLoss: loss }),
  setCurrentAccuracy: (accuracy) => set({ currentAccuracy: accuracy }),

  setTrainingConfig: (config) =>
    set(state => ({
      trainingConfig: { ...state.trainingConfig, ...config },
    })),

  resetTraining: () =>
    set({
      isTraining: false,
      trainingEpoch: 0,
      trainingTotalEpochs: 0,
      lossHistory: [],
      accuracyHistory: [],
      currentLoss: null,
      currentAccuracy: null,
    }),
});
