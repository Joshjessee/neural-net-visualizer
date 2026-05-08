import type { LayerConfig } from '../types/network';

export function calculateLayerParams(layer: LayerConfig, prevLayer: LayerConfig | null): number {
  switch (layer.type) {
    case 'dense':
    case 'output': {
      const inputSize = getOutputUnits(prevLayer);
      const units = layer.units || 1;
      return inputSize * units + units; // weights + biases
    }
    case 'conv2d': {
      const inputChannels = prevLayer?.type === 'conv2d'
        ? (prevLayer.filters || 1)
        : prevLayer?.type === 'input'
          ? (prevLayer.inputShape?.[prevLayer.inputShape.length - 1] || 1)
          : 1;
      const filters = layer.filters || 1;
      const [kh, kw] = layer.kernelSize || [3, 3];
      return inputChannels * filters * kh * kw + filters;
    }
    case 'batchNorm': {
      const features = getOutputUnits(prevLayer);
      return features * 4; // gamma, beta, running_mean, running_var
    }
    case 'embedding': {
      return (layer.vocabSize || 1) * (layer.embeddingDim || 1);
    }
    case 'lstm': {
      const inputSize = getOutputUnits(prevLayer);
      const units = layer.units || 1;
      return 4 * (inputSize * units + units * units + units); // 4 gates
    }
    case 'gru': {
      const inputSize = getOutputUnits(prevLayer);
      const units = layer.units || 1;
      return 3 * (inputSize * units + units * units + units); // 3 gates
    }
    case 'multiHeadAttention': {
      const dim = getOutputUnits(prevLayer);
      const numHeads = layer.numHeads || 8;
      const keyDim = layer.keyDim || 64;
      // Q, K, V projections + output projection
      return 3 * (dim * numHeads * keyDim + numHeads * keyDim) + numHeads * keyDim * dim + dim;
    }
    case 'feedForward': {
      const inputSize = getOutputUnits(prevLayer);
      const hidden = layer.units || 512;
      return inputSize * hidden + hidden + hidden * inputSize + inputSize;
    }
    default:
      return 0;
  }
}

function getOutputUnits(layer: LayerConfig | null): number {
  if (!layer) return 0;
  switch (layer.type) {
    case 'dense':
    case 'output':
    case 'feedForward':
      return layer.units || 1;
    case 'lstm':
    case 'gru':
      return layer.units || 1;
    case 'embedding':
      return layer.embeddingDim || 1;
    case 'input':
      return layer.inputShape?.reduce((a, b) => a * b, 1) || 1;
    case 'conv2d':
      return layer.filters || 1;
    case 'flatten':
      return getOutputUnits(null) || 1;
    default:
      return 1;
  }
}

export function formatParamCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
