import * as tf from '@tensorflow/tfjs';
import type { TrainingConfig } from '../store/slices/trainingSlice';
import { generateTrainingData } from '../data/mnistSubset';
import { generateRegressionData } from '../data/regressionData';
import type { LayerConfig } from '../types/network';

export interface TrainingCallbacks {
  onEpochEnd: (epoch: number, logs: { loss: number; acc?: number }) => void;
  onTrainingEnd: () => void;
  onError: (error: string) => void;
}

export interface TrainingHandle {
  stop: () => void;
}

/**
 * Auto-detect the loss function based on the output layer's activation.
 */
function detectLoss(layers: LayerConfig[]): string {
  const outputLayer = layers[layers.length - 1];
  if (outputLayer?.activation === 'softmax') return 'categoricalCrossentropy';
  if (outputLayer?.activation === 'sigmoid') return 'binaryCrossentropy';
  return 'meanSquaredError';
}

/**
 * Auto-detect metrics based on the loss function.
 */
function detectMetrics(loss: string): string[] {
  if (loss === 'categoricalCrossentropy' || loss === 'binaryCrossentropy') {
    return ['accuracy'];
  }
  return [];
}

export function trainModel(
  model: tf.LayersModel,
  config: TrainingConfig,
  layers: LayerConfig[],
  callbacks: TrainingCallbacks,
): TrainingHandle {
  const SAMPLE_COUNT = 1000;

  const inputLayer = layers.find(l => l.type === 'input');
  const inputShape = inputLayer?.inputShape || [784];

  const loss = detectLoss(layers);
  const metrics = detectMetrics(loss);

  // Compile the model
  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss,
    metrics,
  });

  let stopped = false;

  // Run training asynchronously
  (async () => {
    let xs: tf.Tensor | null = null;
    let ys: tf.Tensor | null = null;

    try {
      // Generate training data
      if (config.datasetId === 'regression') {
        const data = generateRegressionData(SAMPLE_COUNT);
        xs = data.xs;
        ys = data.ys;
      } else {
        const data = generateTrainingData(SAMPLE_COUNT, inputShape);
        xs = data.xs;
        ys = data.ys;
      }

      await model.fit(xs, ys, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (stopped) return;
            const loss = logs?.loss ?? 0;
            const acc = logs?.acc ?? undefined;
            callbacks.onEpochEnd(epoch, { loss, acc });
          },
        },
      });

      if (!stopped) {
        callbacks.onTrainingEnd();
      }
    } catch (e) {
      if (!stopped) {
        callbacks.onError((e as Error).message);
      }
    } finally {
      // Dispose training tensors
      xs?.dispose();
      ys?.dispose();
    }
  })();

  return {
    stop: () => {
      stopped = true;
      model.stopTraining = true;
    },
  };
}
