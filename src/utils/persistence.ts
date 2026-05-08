import type { LayerConfig, ConnectionConfig, ModelType, LayerType } from '../types/network';

const STORAGE_KEY = 'nn-visual-builder-state';

export interface PersistedState {
  version: 1;
  layers: LayerConfig[];
  connections: ConnectionConfig[];
  modelType: ModelType;
  networkName: string;
  presetId: string | null;
}

const VALID_LAYER_TYPES: LayerType[] = [
  'input', 'dense', 'conv2d', 'maxPool2d', 'flatten', 'dropout',
  'batchNorm', 'embedding', 'lstm', 'gru', 'multiHeadAttention',
  'feedForward', 'output',
];

const VALID_MODEL_TYPES: ModelType[] = [
  'linearRegression', 'logisticRegression', 'mlp', 'cnn', 'rnn', 'transformer',
];

export function validateNetworkConfig(data: unknown): data is PersistedState {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) return false;
  if (!Array.isArray(obj.layers)) return false;
  if (!Array.isArray(obj.connections)) return false;
  if (typeof obj.modelType !== 'string' || !VALID_MODEL_TYPES.includes(obj.modelType as ModelType)) return false;
  if (typeof obj.networkName !== 'string') return false;

  // Validate each layer has required fields
  for (const layer of obj.layers) {
    if (!layer || typeof layer !== 'object') return false;
    if (typeof layer.id !== 'string' || !layer.id) return false;
    if (typeof layer.type !== 'string' || !VALID_LAYER_TYPES.includes(layer.type)) return false;
    if (typeof layer.name !== 'string') return false;
  }

  // Validate each connection
  for (const conn of obj.connections) {
    if (!conn || typeof conn !== 'object') return false;
    if (typeof conn.id !== 'string' || !conn.id) return false;
    if (typeof conn.sourceLayerId !== 'string') return false;
    if (typeof conn.targetLayerId !== 'string') return false;
    if (typeof conn.isSkipConnection !== 'boolean') return false;
  }

  return true;
}

export function saveToLocalStorage(state: Omit<PersistedState, 'version'>): void {
  try {
    const data: PersistedState = { version: 1, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // QuotaExceededError or other storage errors — fail silently
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, state not saved.');
    }
  }
}

export function loadFromLocalStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (validateNetworkConfig(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportToJson(state: Omit<PersistedState, 'version'>): void {
  const data: PersistedState = { version: 1, ...state };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.networkName.replace(/\s+/g, '_').toLowerCase() || 'network'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<PersistedState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (validateNetworkConfig(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid network configuration file.'));
        }
      } catch {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

// Debounced auto-save helper
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(state: Omit<PersistedState, 'version'>, delay = 300): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToLocalStorage(state);
  }, delay);
}
