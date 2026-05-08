import type { StateCreator } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { LayerConfig, ConnectionConfig, ModelType, LayerType } from '../../types/network';
import { LAYER_DEFAULTS } from '../../constants/layerDefaults';

export interface NetworkSlice {
  layers: LayerConfig[];
  connections: ConnectionConfig[];
  modelType: ModelType;
  networkName: string;
  presetId: string | null;

  addLayer: (type: LayerType, afterIndex?: number) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<LayerConfig>) => void;
  reorderLayers: (sourceIndex: number, targetIndex: number) => void;
  addConnection: (sourceId: string, targetId: string, isSkip?: boolean) => void;
  removeConnection: (connectionId: string) => void;
  setModelType: (type: ModelType) => void;
  setNetworkName: (name: string) => void;
  loadNetwork: (layers: LayerConfig[], connections: ConnectionConfig[], modelType: ModelType, name: string, presetId?: string) => void;
  clearNetwork: () => void;
  autoConnect: () => void;
}

let layerCounters: Record<string, number> = {};

function getNextLayerName(type: LayerType): string {
  const count = (layerCounters[type] || 0) + 1;
  layerCounters[type] = count;
  const defaults = LAYER_DEFAULTS[type];
  const baseName = type.charAt(0).toUpperCase() + type.slice(1);
  return `${baseName}_${count}`;
}

export const createNetworkSlice: StateCreator<NetworkSlice, [], [], NetworkSlice> = (set, get) => ({
  layers: [],
  connections: [],
  modelType: 'mlp',
  networkName: 'New Network',
  presetId: null,

  addLayer: (type, afterIndex) => {
    const defaults = LAYER_DEFAULTS[type];
    const newLayer: LayerConfig = {
      ...defaults,
      id: uuid(),
      name: getNextLayerName(type),
    };

    set(state => {
      const layers = [...state.layers];
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : layers.length;
      layers.splice(insertIndex, 0, newLayer);

      // Inline auto-connect to produce a single undo entry
      const skipConnections = state.connections.filter(c => c.isSkipConnection);
      const sequential: ConnectionConfig[] = [];
      for (let i = 0; i < layers.length - 1; i++) {
        sequential.push({
          id: uuid(),
          sourceLayerId: layers[i].id,
          targetLayerId: layers[i + 1].id,
          isSkipConnection: false,
        });
      }

      return { layers, connections: [...sequential, ...skipConnections], presetId: null };
    });
  },

  removeLayer: (layerId) => {
    set(state => {
      const layers = state.layers.filter(l => l.id !== layerId);
      const skipConnections = state.connections.filter(
        c => c.isSkipConnection && c.sourceLayerId !== layerId && c.targetLayerId !== layerId
      );
      const sequential: ConnectionConfig[] = [];
      for (let i = 0; i < layers.length - 1; i++) {
        sequential.push({
          id: uuid(),
          sourceLayerId: layers[i].id,
          targetLayerId: layers[i + 1].id,
          isSkipConnection: false,
        });
      }

      return {
        layers,
        connections: [...sequential, ...skipConnections],
        presetId: null,
      };
    });
  },

  updateLayer: (layerId, updates) => {
    set(state => ({
      layers: state.layers.map(l =>
        l.id === layerId ? { ...l, ...updates } : l
      ),
      presetId: null,
    }));
  },

  reorderLayers: (sourceIndex, targetIndex) => {
    set(state => {
      const layers = [...state.layers];
      const [moved] = layers.splice(sourceIndex, 1);
      layers.splice(targetIndex, 0, moved);

      // Inline auto-connect to produce a single undo entry
      const skipConnections = state.connections.filter(c => c.isSkipConnection);
      const sequential: ConnectionConfig[] = [];
      for (let i = 0; i < layers.length - 1; i++) {
        sequential.push({
          id: uuid(),
          sourceLayerId: layers[i].id,
          targetLayerId: layers[i + 1].id,
          isSkipConnection: false,
        });
      }

      return { layers, connections: [...sequential, ...skipConnections], presetId: null };
    });
  },

  addConnection: (sourceId, targetId, isSkip = false) => {
    const existing = get().connections.find(
      c => c.sourceLayerId === sourceId && c.targetLayerId === targetId
    );
    if (existing) return;

    set(state => ({
      connections: [
        ...state.connections,
        { id: uuid(), sourceLayerId: sourceId, targetLayerId: targetId, isSkipConnection: isSkip },
      ],
    }));
  },

  removeConnection: (connectionId) => {
    set(state => ({
      connections: state.connections.filter(c => c.id !== connectionId),
    }));
  },

  setModelType: (type) => {
    set({ modelType: type });
  },

  setNetworkName: (name) => {
    set({ networkName: name });
  },

  loadNetwork: (layers, connections, modelType, name, presetId) => {
    layerCounters = {};
    set({ layers, connections, modelType, networkName: name, presetId: presetId || null });
  },

  clearNetwork: () => {
    layerCounters = {};
    set({ layers: [], connections: [], presetId: null, networkName: 'New Network' });
  },

  autoConnect: () => {
    set(state => {
      const skipConnections = state.connections.filter(c => c.isSkipConnection);
      const sequential: ConnectionConfig[] = [];

      for (let i = 0; i < state.layers.length - 1; i++) {
        sequential.push({
          id: uuid(),
          sourceLayerId: state.layers[i].id,
          targetLayerId: state.layers[i + 1].id,
          isSkipConnection: false,
        });
      }

      return { connections: [...sequential, ...skipConnections] };
    });
  },
});
