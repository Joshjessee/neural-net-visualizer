import type { LayerConfig } from '../types/network';

export interface ShapeInfo {
  inputShape: number[] | null;
  outputShape: number[] | null;
  error?: string;
}

export function computeOutputShape(layer: LayerConfig, inputShape: number[] | null): number[] | null {
  if (!inputShape) return null;

  switch (layer.type) {
    case 'input':
      return layer.inputShape || null;

    case 'dense':
    case 'output':
      return [layer.units || 1];

    case 'conv2d': {
      // Expects [H, W, C] input
      if (inputShape.length < 2) return null;
      const h = inputShape[0];
      const w = inputShape[1];
      const kh = layer.kernelSize?.[0] || 3;
      const kw = layer.kernelSize?.[1] || 3;
      const outH = h - kh + 1;
      const outW = w - kw + 1;
      if (outH <= 0 || outW <= 0) return null;
      return [outH, outW, layer.filters || 32];
    }

    case 'maxPool2d': {
      // Expects [H, W, C] input
      if (inputShape.length < 2) return null;
      const h = inputShape[0];
      const w = inputShape[1];
      const c = inputShape.length >= 3 ? inputShape[2] : 1;
      const ph = layer.poolSize?.[0] || 2;
      const pw = layer.poolSize?.[1] || 2;
      const outH = Math.floor(h / ph);
      const outW = Math.floor(w / pw);
      if (outH <= 0 || outW <= 0) return null;
      return [outH, outW, c];
    }

    case 'flatten': {
      const total = inputShape.reduce((a, b) => a * b, 1);
      return [total];
    }

    case 'dropout':
    case 'batchNorm':
      // Pass-through — same shape as input
      return [...inputShape];

    case 'embedding': {
      // Input: [seqLen], Output: [seqLen, embeddingDim]
      const seqLen = inputShape.length === 1 ? inputShape[0] : inputShape[inputShape.length - 1];
      return [seqLen, layer.embeddingDim || 128];
    }

    case 'lstm':
    case 'gru': {
      // Input: [seqLen, features] or [features]
      if (layer.returnSequences) {
        const seqLen = inputShape.length >= 2 ? inputShape[0] : 1;
        return [seqLen, layer.units || 64];
      }
      return [layer.units || 64];
    }

    case 'multiHeadAttention': {
      // Simplified: output same spatial dims, but with keyDim * numHeads
      const dim = (layer.numHeads || 4) * (layer.keyDim || 32);
      if (inputShape.length >= 2) {
        return [inputShape[0], dim];
      }
      return [dim];
    }

    case 'feedForward':
      return [layer.units || 256];

    default:
      return null;
  }
}

export function propagateShapes(
  layers: LayerConfig[],
): Map<string, ShapeInfo> {
  const result = new Map<string, ShapeInfo>();

  let currentShape: number[] | null = null;

  for (const layer of layers) {
    if (layer.type === 'input') {
      const outputShape = layer.inputShape || null;
      result.set(layer.id, {
        inputShape: null,
        outputShape,
      });
      currentShape = outputShape;
      continue;
    }

    const inputShape = currentShape;
    try {
      const outputShape = computeOutputShape(layer, inputShape);
      if (outputShape === null && inputShape !== null) {
        result.set(layer.id, {
          inputShape,
          outputShape: null,
          error: 'Incompatible shape',
        });
      } else {
        result.set(layer.id, { inputShape, outputShape });
      }
      currentShape = outputShape;
    } catch {
      result.set(layer.id, {
        inputShape,
        outputShape: null,
        error: 'Shape computation error',
      });
      currentShape = null;
    }
  }

  return result;
}

export function formatShape(shape: number[] | null | undefined): string {
  if (!shape) return '[?]';
  return `[${shape.join(', ')}]`;
}
