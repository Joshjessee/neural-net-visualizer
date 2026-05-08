export type ActivationFn =
  | 'relu'
  | 'sigmoid'
  | 'tanh'
  | 'softmax'
  | 'leakyRelu'
  | 'gelu'
  | 'swish'
  | 'linear';

export type LayerType =
  | 'input'
  | 'dense'
  | 'conv2d'
  | 'maxPool2d'
  | 'flatten'
  | 'dropout'
  | 'batchNorm'
  | 'embedding'
  | 'lstm'
  | 'gru'
  | 'multiHeadAttention'
  | 'feedForward'
  | 'output';

export type ModelType =
  | 'linearRegression'
  | 'logisticRegression'
  | 'mlp'
  | 'cnn'
  | 'rnn'
  | 'transformer';

export interface LayerConfig {
  id: string;
  type: LayerType;
  name: string;
  units?: number;
  filters?: number;
  kernelSize?: [number, number];
  poolSize?: [number, number];
  rate?: number;
  activation?: ActivationFn;
  returnSequences?: boolean;
  numHeads?: number;
  keyDim?: number;
  embeddingDim?: number;
  vocabSize?: number;
  inputShape?: number[];
}

export interface ConnectionConfig {
  id: string;
  sourceLayerId: string;
  targetLayerId: string;
  isSkipConnection: boolean;
}

export interface NetworkConfig {
  id: string;
  name: string;
  modelType: ModelType;
  layers: LayerConfig[];
  connections: ConnectionConfig[];
}
