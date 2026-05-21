import type { LayerType } from '../types/network';

export const BEGINNER_VISIBLE_PARAMS: Record<LayerType, string[]> = {
  input: ['inputShape'],
  dense: ['units', 'activation'],
  conv2d: ['filters', 'activation'],
  maxPool2d: [],
  flatten: [],
  dropout: ['rate'],
  batchNorm: [],
  embedding: ['embeddingDim'],
  lstm: ['units', 'activation'],
  gru: ['units', 'activation'],
  multiHeadAttention: ['numHeads'],
  feedForward: ['units', 'activation'],
  output: ['units', 'activation'],
};

export const BEGINNER_LABELS: Record<string, string> = {
  units: 'Neurons',
  filters: 'Feature Detectors',
  activation: 'Activation',
  rate: 'Drop Rate',
  inputShape: 'Input Shape',
  embeddingDim: 'Embedding Size',
  numHeads: 'Attention Heads',
};

export const LAYER_DESCRIPTIONS: Record<LayerType, string> = {
  input: 'The entry point for your data — defines what shape of data the network expects.',
  dense: 'Connects every input to every output neuron. The most common building block.',
  conv2d: 'Scans a small window across the input to detect patterns like edges and textures.',
  maxPool2d: 'Shrinks the data by keeping only the strongest signals in each region.',
  flatten: 'Reshapes multi-dimensional data into a single list of numbers.',
  dropout: 'Randomly ignores some neurons during training to prevent over-memorization.',
  batchNorm: 'Normalizes values between layers to help training stay stable.',
  embedding: 'Converts categories (like words) into meaningful number vectors.',
  lstm: 'Processes sequences while remembering important information from earlier steps.',
  gru: 'A simpler version of LSTM — also good at processing sequences.',
  multiHeadAttention: 'Lets the network focus on the most relevant parts of the input.',
  feedForward: 'A pair of dense layers used inside transformer blocks.',
  output: 'The final layer — produces the network\'s prediction or answer.',
};

export const BEGINNER_TRAINING_VISIBLE = ['epochs', 'datasetId'];
