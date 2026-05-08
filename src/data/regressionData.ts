import * as tf from '@tensorflow/tfjs';

/**
 * Generate synthetic regression data: y = sin(x) + noise
 * Input shape: [1], Output shape: [1]
 */
export function generateRegressionData(
  count: number,
): { xs: tf.Tensor; ys: tf.Tensor } {
  const xValues: number[] = [];
  const yValues: number[] = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1) * Math.PI * 2; // [-2pi, 2pi]
    const noise = (Math.random() - 0.5) * 0.2;
    const y = Math.sin(x) + noise;

    xValues.push(x);
    yValues.push(y);
  }

  // Normalize x to [0, 1] for easier training
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const xRange = xMax - xMin || 1;

  const normalizedX = xValues.map(x => (x - xMin) / xRange);

  const xs = tf.tensor2d(normalizedX, [count, 1]);
  const ys = tf.tensor2d(yValues, [count, 1]);

  return { xs, ys };
}
