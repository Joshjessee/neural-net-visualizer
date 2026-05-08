export interface ActivationData {
  layerId: string;
  values: Float32Array;
  shape: number[];
}

export type DatasetId = 'mnist' | 'regression';

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  description: string;
  inputShape: number[];
  outputSize: number;
}

export interface SampleData {
  input: number[];
  label: number;
}
