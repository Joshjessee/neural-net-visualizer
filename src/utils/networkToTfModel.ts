import * as tf from '@tensorflow/tfjs';
import type { LayerConfig } from '../types/network';

export interface BuildResult {
  model: tf.LayersModel;
  error: string | null;
}

export function buildTfModel(layers: LayerConfig[]): BuildResult {
  try {
    if (layers.length < 2) {
      return { model: null as unknown as tf.LayersModel, error: 'Need at least 2 layers (input + output)' };
    }

    const inputLayer = layers[0];
    if (inputLayer.type !== 'input' || !inputLayer.inputShape) {
      return { model: null as unknown as tf.LayersModel, error: 'First layer must be an Input layer with a shape' };
    }

    const model = tf.sequential();

    for (let i = 1; i < layers.length; i++) {
      const layer = layers[i];
      const isFirst = i === 1;
      const inputShape = isFirst ? inputLayer.inputShape : undefined;

      const tfLayer = createTfLayer(layer, inputShape);
      if (tfLayer) {
        model.add(tfLayer);
      }
    }

    return { model, error: null };
  } catch (e) {
    return { model: null as unknown as tf.LayersModel, error: (e as Error).message };
  }
}

function createTfLayer(layer: LayerConfig, inputShape?: number[]): tf.layers.Layer | null {
  const mapActivation = (act?: string) => {
    if (!act || act === 'linear') return undefined;
    if (act === 'leakyRelu') return 'relu'; // TF.js doesn't support leakyRelu as string in some contexts
    if (act === 'swish') return 'relu'; // fallback
    if (act === 'gelu') return 'relu'; // fallback
    return act;
  };

  switch (layer.type) {
    case 'dense':
    case 'output':
      return tf.layers.dense({
        units: layer.units || 1,
        activation: mapActivation(layer.activation) as never,
        inputShape,
      });

    case 'conv2d':
      return tf.layers.conv2d({
        filters: layer.filters || 32,
        kernelSize: layer.kernelSize || [3, 3],
        activation: mapActivation(layer.activation) as never,
        inputShape,
      });

    case 'maxPool2d':
      return tf.layers.maxPooling2d({
        poolSize: layer.poolSize || [2, 2],
        inputShape,
      });

    case 'flatten':
      return tf.layers.flatten({ inputShape });

    case 'dropout':
      return tf.layers.dropout({
        rate: layer.rate || 0.5,
        inputShape,
      });

    case 'batchNorm':
      return tf.layers.batchNormalization({ inputShape });

    case 'embedding':
      return tf.layers.embedding({
        inputDim: layer.vocabSize || 10000,
        outputDim: layer.embeddingDim || 128,
        inputShape,
      });

    case 'lstm':
      return tf.layers.lstm({
        units: layer.units || 64,
        returnSequences: layer.returnSequences || false,
        inputShape,
      });

    case 'gru':
      return tf.layers.gru({
        units: layer.units || 64,
        returnSequences: layer.returnSequences || false,
        inputShape,
      });

    case 'multiHeadAttention':
    case 'feedForward':
      return tf.layers.dense({
        units: layer.units || layer.keyDim || 64,
        activation: mapActivation(layer.activation) as never,
        inputShape,
      });

    default:
      return null;
  }
}

const MAX_ACTIVATION_VALUES = 2048;

function sampleTensorValues(rawData: Float32Array | Int32Array | Uint8Array): number[] {
  if (rawData.length <= MAX_ACTIVATION_VALUES) {
    return Array.from(rawData);
  }
  const values: number[] = [];
  const step = rawData.length / MAX_ACTIVATION_VALUES;
  for (let j = 0; j < MAX_ACTIVATION_VALUES; j++) {
    values.push(rawData[Math.floor(j * step)]);
  }
  return values;
}

function prepareInputData(inputData: number[], inputShape: number[]): number[] {
  const expectedSize = inputShape.reduce((a, b) => a * b, 1);
  if (inputData.length < expectedSize) {
    return [...inputData, ...new Array(expectedSize - inputData.length).fill(0)];
  } else if (inputData.length > expectedSize) {
    return inputData.slice(0, expectedSize);
  }
  return inputData;
}

export function runInference(
  model: tf.LayersModel,
  inputData: number[],
  inputShape: number[]
): { output: number[]; activations: Record<string, { values: number[]; shape: number[] }> } {
  const data = prepareInputData(inputData, inputShape);
  const activations: Record<string, { values: number[]; shape: number[] }> = {};

  // Try multi-output model approach (captures all layer activations)
  try {
    const inputTensor = tf.tensor(data).reshape([1, ...inputShape]);
    const layerOutputs = model.layers.map(l => l.output as tf.SymbolicTensor);
    const multiOutputModel = tf.model({
      inputs: model.inputs,
      outputs: layerOutputs,
    });

    const predictions = multiOutputModel.predict(inputTensor) as tf.Tensor[];
    const results = Array.isArray(predictions) ? predictions : [predictions];

    results.forEach((tensor, i) => {
      const layerName = model.layers[i].name;
      activations[layerName] = {
        values: sampleTensorValues(tensor.dataSync()),
        shape: tensor.shape.slice(1) as number[],
      };
    });

    const output = Array.from(results[results.length - 1].dataSync());

    inputTensor.dispose();
    results.forEach(t => t.dispose());
    // Do NOT dispose multiOutputModel — it shares layers/weights with the
    // original model. Disposing it would destroy the original's kernels.

    return { output, activations };
  } catch {
    // Multi-output failed (likely OOM). Try layer-by-layer approach.
  }

  // Layer-by-layer fallback: run each layer individually to extract activations
  // without holding all intermediate tensors simultaneously
  try {
    const inputTensor = tf.tensor(data).reshape([1, ...inputShape]);

    // First get the final output
    const finalResult = model.predict(inputTensor) as tf.Tensor;
    const output = Array.from(finalResult.dataSync());
    finalResult.dispose();

    // Now extract activations one layer at a time
    for (let i = 0; i < model.layers.length; i++) {
      try {
        const layerOutput = model.layers[i].output as tf.SymbolicTensor;
        const singleModel = tf.model({
          inputs: model.inputs,
          outputs: [layerOutput],
        });
        const pred = singleModel.predict(inputTensor) as tf.Tensor;
        activations[model.layers[i].name] = {
          values: sampleTensorValues(pred.dataSync()),
          shape: pred.shape.slice(1) as number[],
        };
        pred.dispose();
        // Do NOT dispose singleModel — shares layers with original model
      } catch {
        // Skip this layer's activations if it fails
        activations[model.layers[i].name] = {
          values: [0],
          shape: [1],
        };
      }
    }

    inputTensor.dispose();
    return { output, activations };
  } catch {
    // Total fallback: just get final output, no activations
    try {
      const inputTensor = tf.tensor(data).reshape([1, ...inputShape]);
      const result = model.predict(inputTensor) as tf.Tensor;
      const output = Array.from(result.dataSync());
      inputTensor.dispose();
      result.dispose();
      return { output, activations: {} };
    } catch {
      return { output: [], activations: {} };
    }
  }
}
