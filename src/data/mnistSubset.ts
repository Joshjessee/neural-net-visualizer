import * as tf from '@tensorflow/tfjs';

/**
 * Generate synthetic MNIST-like digit patterns for training.
 * Uses the same digit-pattern approach as sampleData.ts but produces
 * TF.js tensors suitable for model.fit().
 */
export function generateTrainingData(
  count: number,
  inputShape: number[],
): { xs: tf.Tensor; ys: tf.Tensor; numClasses: number } {
  const totalSize = inputShape.reduce((a, b) => a * b, 1);
  const numClasses = 10;

  const xData: number[][] = [];
  const yLabels: number[] = [];

  for (let i = 0; i < count; i++) {
    const label = Math.floor(Math.random() * numClasses);
    yLabels.push(label);

    if (totalSize <= 784) {
      xData.push(generateDigitPattern(totalSize, label));
    } else {
      // For larger inputs, generate structured wave patterns
      const maxAlloc = Math.min(totalSize, 10000);
      const input = new Array(totalSize).fill(0);
      for (let j = 0; j < maxAlloc; j++) {
        const t = j / maxAlloc;
        const wave = Math.sin(t * Math.PI * (label + 1) * 2) * 0.5 + 0.5;
        const noise = Math.random() * 0.15;
        input[j] = wave * 0.8 + noise;
      }
      xData.push(input);
    }
  }

  const xs = tf.tensor2d(xData, [count, totalSize]).reshape([count, ...inputShape]);
  const ys = tf.oneHot(tf.tensor1d(yLabels, 'int32'), numClasses).cast('float32');

  return { xs, ys, numClasses };
}

function generateDigitPattern(size: number, label: number): number[] {
  const input = new Array(size).fill(0);
  const side = Math.ceil(Math.sqrt(size));

  for (let i = 0; i < size; i++) {
    const x = i % side;
    const y = Math.floor(i / side);
    const cx = side / 2, cy = side / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const maxR = side / 2;

    let val = 0;
    if (label === 0 && dist > maxR * 0.4 && dist < maxR * 0.7) val = 1;
    else if (label === 1 && Math.abs(x - cx) < side * 0.07 && y > side * 0.15 && y < side * 0.85) val = 1;
    else if (label === 2 && (y < side * 0.3 || y > side * 0.7 || (y > side * 0.4 && y < side * 0.6)) && x > side * 0.2 && x < side * 0.8) val = 1;
    else if (label === 3 && ((y < side * 0.2) || (y > side * 0.4 && y < side * 0.6) || (y > side * 0.8)) && x > side * 0.2 && x < side * 0.8) val = 1;
    else if (label === 4 && ((x < side * 0.35 && y < side * 0.55) || Math.abs(x - side * 0.65) < side * 0.07)) val = 1;
    else if (label === 5 && ((y < side * 0.2 && x > side * 0.2) || (y > side * 0.4 && y < side * 0.6 && x < side * 0.8) || (y > side * 0.8 && x < side * 0.8))) val = 1;
    else if (label === 6 && (dist < maxR * 0.7 && (y > cy || x < side * 0.35))) val = 1;
    else if (label === 7 && ((y < side * 0.2) || Math.abs(x - cx + (y - side * 0.2) * 0.3) < side * 0.07)) val = 1;
    else if (label === 8 && ((dist > maxR * 0.2 && dist < maxR * 0.45) || (dist > maxR * 0.55 && dist < maxR * 0.8))) val = 1;
    else if (label === 9 && (dist < maxR * 0.7 && (y < cy || x > side * 0.65))) val = 1;

    input[i] = val > 0 ? val : Math.random() * 0.05;
  }

  return input;
}
