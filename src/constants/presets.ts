import { v4 as uuid } from 'uuid';
import type { LayerConfig, ConnectionConfig, ModelType } from '../types/network';

interface PresetConfig {
  name: string;
  layers: LayerConfig[];
  connections: ConnectionConfig[];
  modelType: ModelType;
}

interface PresetDefinition {
  name: string;
  description: string;
  create: () => PresetConfig;
}

function seq(layers: LayerConfig[]): ConnectionConfig[] {
  const conns: ConnectionConfig[] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    conns.push({
      id: uuid(),
      sourceLayerId: layers[i].id,
      targetLayerId: layers[i + 1].id,
      isSkipConnection: false,
    });
  }
  return conns;
}

function createSimpleMLP(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [784] },
    { id: uuid(), type: 'dense', name: 'Dense_1', units: 128, activation: 'relu' },
    { id: uuid(), type: 'dropout', name: 'Dropout_1', rate: 0.2 },
    { id: uuid(), type: 'dense', name: 'Dense_2', units: 64, activation: 'relu' },
    { id: uuid(), type: 'dense', name: 'Output', units: 10, activation: 'softmax' },
  ];
  return { name: 'Simple MLP', layers, connections: seq(layers), modelType: 'mlp' };
}

function createLeNet(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [28, 28, 1] },
    { id: uuid(), type: 'conv2d', name: 'Conv_1', filters: 6, kernelSize: [5, 5], activation: 'tanh' },
    { id: uuid(), type: 'maxPool2d', name: 'Pool_1', poolSize: [2, 2] },
    { id: uuid(), type: 'conv2d', name: 'Conv_2', filters: 16, kernelSize: [5, 5], activation: 'tanh' },
    { id: uuid(), type: 'maxPool2d', name: 'Pool_2', poolSize: [2, 2] },
    { id: uuid(), type: 'flatten', name: 'Flatten' },
    { id: uuid(), type: 'dense', name: 'FC_1', units: 120, activation: 'tanh' },
    { id: uuid(), type: 'dense', name: 'FC_2', units: 84, activation: 'tanh' },
    { id: uuid(), type: 'dense', name: 'Output', units: 10, activation: 'softmax' },
  ];
  return { name: 'LeNet-5', layers, connections: seq(layers), modelType: 'cnn' };
}

function createAlexNet(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [64, 64, 3] },
    { id: uuid(), type: 'conv2d', name: 'Conv_1', filters: 32, kernelSize: [5, 5], activation: 'relu' },
    { id: uuid(), type: 'maxPool2d', name: 'Pool_1', poolSize: [2, 2] },
    { id: uuid(), type: 'conv2d', name: 'Conv_2', filters: 64, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'maxPool2d', name: 'Pool_2', poolSize: [2, 2] },
    { id: uuid(), type: 'conv2d', name: 'Conv_3', filters: 128, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'conv2d', name: 'Conv_4', filters: 128, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'conv2d', name: 'Conv_5', filters: 64, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'maxPool2d', name: 'Pool_3', poolSize: [2, 2] },
    { id: uuid(), type: 'flatten', name: 'Flatten' },
    { id: uuid(), type: 'dense', name: 'FC_1', units: 512, activation: 'relu' },
    { id: uuid(), type: 'dropout', name: 'Dropout_1', rate: 0.5 },
    { id: uuid(), type: 'dense', name: 'FC_2', units: 512, activation: 'relu' },
    { id: uuid(), type: 'dropout', name: 'Dropout_2', rate: 0.5 },
    { id: uuid(), type: 'dense', name: 'Output', units: 100, activation: 'softmax' },
  ];
  return { name: 'AlexNet', layers, connections: seq(layers), modelType: 'cnn' };
}

function createResNet(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [32, 32, 3] },
    { id: uuid(), type: 'conv2d', name: 'Conv_Initial', filters: 64, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'batchNorm', name: 'BN_1' },
    // Residual Block 1
    { id: uuid(), type: 'conv2d', name: 'Res1_Conv1', filters: 64, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'batchNorm', name: 'Res1_BN1' },
    { id: uuid(), type: 'conv2d', name: 'Res1_Conv2', filters: 64, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'batchNorm', name: 'Res1_BN2' },
    // Residual Block 2
    { id: uuid(), type: 'conv2d', name: 'Res2_Conv1', filters: 128, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'batchNorm', name: 'Res2_BN1' },
    { id: uuid(), type: 'conv2d', name: 'Res2_Conv2', filters: 128, kernelSize: [3, 3], activation: 'relu' },
    { id: uuid(), type: 'batchNorm', name: 'Res2_BN2' },
    // Head
    { id: uuid(), type: 'flatten', name: 'Flatten' },
    { id: uuid(), type: 'dense', name: 'Output', units: 10, activation: 'softmax' },
  ];

  const connections = seq(layers);
  // Skip connection: BN_1 -> Res1_BN2 (residual block 1)
  connections.push({
    id: uuid(),
    sourceLayerId: layers[2].id,  // BN_1
    targetLayerId: layers[6].id,  // Res1_BN2
    isSkipConnection: true,
  });
  // Skip connection: Res1_BN2 -> Res2_BN2 (residual block 2)
  connections.push({
    id: uuid(),
    sourceLayerId: layers[6].id,  // Res1_BN2
    targetLayerId: layers[10].id, // Res2_BN2
    isSkipConnection: true,
  });

  return { name: 'ResNet (Mini)', layers, connections, modelType: 'cnn' };
}

function createBERT(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [64] },
    { id: uuid(), type: 'embedding', name: 'Token_Embed', vocabSize: 5000, embeddingDim: 128 },
    // Encoder Block 1
    { id: uuid(), type: 'multiHeadAttention', name: 'Enc1_Attention', numHeads: 4, keyDim: 32 },
    { id: uuid(), type: 'batchNorm', name: 'Enc1_LayerNorm1' },
    { id: uuid(), type: 'feedForward', name: 'Enc1_FFN', units: 256, activation: 'gelu' },
    { id: uuid(), type: 'batchNorm', name: 'Enc1_LayerNorm2' },
    // Encoder Block 2
    { id: uuid(), type: 'multiHeadAttention', name: 'Enc2_Attention', numHeads: 4, keyDim: 32 },
    { id: uuid(), type: 'batchNorm', name: 'Enc2_LayerNorm1' },
    { id: uuid(), type: 'feedForward', name: 'Enc2_FFN', units: 256, activation: 'gelu' },
    { id: uuid(), type: 'batchNorm', name: 'Enc2_LayerNorm2' },
    // Output head
    { id: uuid(), type: 'flatten', name: 'Flatten' },
    { id: uuid(), type: 'dense', name: 'Output', units: 2, activation: 'softmax' },
  ];

  const connections = seq(layers);
  // Residual connections within encoder blocks
  connections.push({
    id: uuid(),
    sourceLayerId: layers[1].id, // Embedding
    targetLayerId: layers[3].id, // Enc1_LayerNorm1
    isSkipConnection: true,
  });
  connections.push({
    id: uuid(),
    sourceLayerId: layers[3].id, // Enc1_LayerNorm1
    targetLayerId: layers[5].id, // Enc1_LayerNorm2
    isSkipConnection: true,
  });

  return { name: 'BERT (Mini)', layers, connections, modelType: 'transformer' };
}

function createGPT(): PresetConfig {
  const layers: LayerConfig[] = [
    { id: uuid(), type: 'input', name: 'Input', inputShape: [64] },
    { id: uuid(), type: 'embedding', name: 'Token_Embed', vocabSize: 5000, embeddingDim: 128 },
    // Decoder Block 1
    { id: uuid(), type: 'multiHeadAttention', name: 'Dec1_MaskedAttn', numHeads: 4, keyDim: 32 },
    { id: uuid(), type: 'batchNorm', name: 'Dec1_LayerNorm1' },
    { id: uuid(), type: 'feedForward', name: 'Dec1_FFN', units: 256, activation: 'gelu' },
    { id: uuid(), type: 'batchNorm', name: 'Dec1_LayerNorm2' },
    // Decoder Block 2
    { id: uuid(), type: 'multiHeadAttention', name: 'Dec2_MaskedAttn', numHeads: 4, keyDim: 32 },
    { id: uuid(), type: 'batchNorm', name: 'Dec2_LayerNorm1' },
    { id: uuid(), type: 'feedForward', name: 'Dec2_FFN', units: 256, activation: 'gelu' },
    { id: uuid(), type: 'batchNorm', name: 'Dec2_LayerNorm2' },
    // Output head
    { id: uuid(), type: 'flatten', name: 'Flatten' },
    { id: uuid(), type: 'dense', name: 'Output', units: 5000, activation: 'softmax' },
  ];

  const connections = seq(layers);
  connections.push({
    id: uuid(),
    sourceLayerId: layers[1].id,
    targetLayerId: layers[3].id,
    isSkipConnection: true,
  });
  connections.push({
    id: uuid(),
    sourceLayerId: layers[3].id,
    targetLayerId: layers[5].id,
    isSkipConnection: true,
  });

  return { name: 'GPT (Mini)', layers, connections, modelType: 'transformer' };
}

export type PresetId = 'simpleMLP' | 'lenet' | 'alexnet' | 'resnet' | 'bert' | 'gpt';

export const PRESETS: Record<PresetId, PresetDefinition> = {
  simpleMLP: { name: 'Simple MLP', description: 'Basic multi-layer perceptron for MNIST', create: createSimpleMLP },
  lenet: { name: 'LeNet-5', description: 'Classic CNN for digit recognition', create: createLeNet },
  alexnet: { name: 'AlexNet', description: 'Deep CNN that won ImageNet 2012', create: createAlexNet },
  resnet: { name: 'ResNet (Mini)', description: 'Residual network with skip connections', create: createResNet },
  bert: { name: 'BERT (Mini)', description: 'Bidirectional encoder transformer', create: createBERT },
  gpt: { name: 'GPT (Mini)', description: 'Decoder-only transformer', create: createGPT },
};
