import type { ActivationFn } from '../types/network';

export interface ActivationInfo {
  name: string;
  description: string;
  points: { x: number; y: number }[];
}

function generatePoints(fn: (x: number) => number, min = -4, max = 4, steps = 50): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = min + (max - min) * (i / steps);
    points.push({ x, y: fn(x) });
  }
  return points;
}

export const ACTIVATIONS: Record<ActivationFn, ActivationInfo> = {
  relu: {
    name: 'ReLU',
    description: 'max(0, x) — Most popular for hidden layers',
    points: generatePoints(x => Math.max(0, x)),
  },
  sigmoid: {
    name: 'Sigmoid',
    description: '1/(1+e^-x) — Output range [0,1]',
    points: generatePoints(x => 1 / (1 + Math.exp(-x))),
  },
  tanh: {
    name: 'Tanh',
    description: 'Hyperbolic tangent — Output range [-1,1]',
    points: generatePoints(x => Math.tanh(x)),
  },
  softmax: {
    name: 'Softmax',
    description: 'Normalized exponential — Used for classification output',
    points: generatePoints(x => 1 / (1 + Math.exp(-x))),
  },
  leakyRelu: {
    name: 'Leaky ReLU',
    description: 'max(0.01x, x) — Prevents dying neurons',
    points: generatePoints(x => x > 0 ? x : 0.01 * x),
  },
  gelu: {
    name: 'GELU',
    description: 'Gaussian Error Linear Unit — Used in Transformers',
    points: generatePoints(x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)))),
  },
  swish: {
    name: 'Swish',
    description: 'x · sigmoid(x) — Smooth, non-monotonic',
    points: generatePoints(x => x / (1 + Math.exp(-x))),
  },
  linear: {
    name: 'Linear',
    description: 'f(x) = x — No activation (identity)',
    points: generatePoints(x => x),
  },
};
