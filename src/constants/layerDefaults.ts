import type { LayerConfig, LayerType, ModelType } from '../types/network';

type LayerDefaults = Omit<LayerConfig, 'id' | 'name'>;

export const LAYER_DEFAULTS: Record<LayerType, LayerDefaults> = {
  input: {
    type: 'input',
    inputShape: [784],
  },
  dense: {
    type: 'dense',
    units: 128,
    activation: 'relu',
  },
  conv2d: {
    type: 'conv2d',
    filters: 32,
    kernelSize: [3, 3],
    activation: 'relu',
  },
  maxPool2d: {
    type: 'maxPool2d',
    poolSize: [2, 2],
  },
  flatten: {
    type: 'flatten',
  },
  dropout: {
    type: 'dropout',
    rate: 0.5,
  },
  batchNorm: {
    type: 'batchNorm',
  },
  embedding: {
    type: 'embedding',
    vocabSize: 10000,
    embeddingDim: 128,
  },
  lstm: {
    type: 'lstm',
    units: 64,
    returnSequences: false,
    activation: 'tanh',
  },
  gru: {
    type: 'gru',
    units: 64,
    returnSequences: false,
    activation: 'tanh',
  },
  multiHeadAttention: {
    type: 'multiHeadAttention',
    numHeads: 8,
    keyDim: 64,
  },
  feedForward: {
    type: 'feedForward',
    units: 512,
    activation: 'relu',
  },
  output: {
    type: 'output',
    units: 10,
    activation: 'softmax',
  },
};

export const LAYER_DISPLAY_NAMES: Record<LayerType, string> = {
  input: 'Input',
  dense: 'Dense',
  conv2d: 'Conv2D',
  maxPool2d: 'MaxPool2D',
  flatten: 'Flatten',
  dropout: 'Dropout',
  batchNorm: 'Batch Norm',
  embedding: 'Embedding',
  lstm: 'LSTM',
  gru: 'GRU',
  multiHeadAttention: 'Multi-Head Attention',
  feedForward: 'Feed Forward',
  output: 'Output',
};

export const MODEL_TYPE_LAYERS: Record<ModelType, LayerType[]> = {
  linearRegression: ['input', 'dense', 'output'],
  logisticRegression: ['input', 'dense', 'output'],
  mlp: ['input', 'dense', 'dropout', 'batchNorm', 'output'],
  cnn: ['input', 'conv2d', 'maxPool2d', 'flatten', 'dense', 'dropout', 'batchNorm', 'output'],
  rnn: ['input', 'embedding', 'lstm', 'gru', 'dense', 'dropout', 'output'],
  transformer: ['input', 'embedding', 'multiHeadAttention', 'feedForward', 'dense', 'dropout', 'batchNorm', 'output'],
};

export const MODEL_TYPE_NAMES: Record<ModelType, string> = {
  linearRegression: 'Linear Regression',
  logisticRegression: 'Logistic Regression',
  mlp: 'Multi-Layer Perceptron',
  cnn: 'Convolutional Neural Network',
  rnn: 'Recurrent Neural Network',
  transformer: 'Transformer',
};
