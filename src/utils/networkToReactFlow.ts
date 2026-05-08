import type { Node, Edge } from '@xyflow/react';
import type { LayerConfig, ConnectionConfig } from '../types/network';
import type { ShapeInfo } from './shapePropagator';
import { formatShape } from './shapePropagator';

const LAYER_SPACING_Y = 100;
const CENTER_X = 400;

export interface LayerNodeData {
  layer: LayerConfig;
  isSelected: boolean;
  index: number;
  outputShape?: string;
  [key: string]: unknown;
}

export function networkToReactFlowNodes(
  layers: LayerConfig[],
  selectedLayerId: string | null,
  shapes?: Map<string, ShapeInfo>,
): Node<LayerNodeData>[] {
  return layers.map((layer, index) => {
    const shapeInfo = shapes?.get(layer.id);
    return {
      id: layer.id,
      type: 'layerNode',
      position: { x: CENTER_X - 100, y: index * LAYER_SPACING_Y + 50 },
      data: {
        layer,
        isSelected: layer.id === selectedLayerId,
        index,
        outputShape: shapeInfo?.outputShape
          ? formatShape(shapeInfo.outputShape)
          : shapeInfo?.error
            ? '[?]'
            : undefined,
      },
      draggable: true,
    };
  });
}

export function networkToReactFlowEdges(
  connections: ConnectionConfig[],
  layers: LayerConfig[],
  shapes?: Map<string, ShapeInfo>,
): Edge[] {
  return connections.map(conn => {
    if (conn.isSkipConnection) {
      return {
        id: conn.id,
        source: conn.sourceLayerId,
        target: conn.targetLayerId,
        type: 'skipEdge',
        animated: true,
        style: { stroke: '#ef4444', strokeDasharray: '5,5', strokeWidth: 2 },
      };
    }

    // For sequential edges, attach the target layer's input shape as a label
    const targetLayer = layers.find(l => l.id === conn.targetLayerId);
    const shapeInfo = targetLayer ? shapes?.get(targetLayer.id) : undefined;
    const shapeLabel = shapeInfo?.inputShape
      ? formatShape(shapeInfo.inputShape)
      : undefined;

    return {
      id: conn.id,
      source: conn.sourceLayerId,
      target: conn.targetLayerId,
      type: shapeLabel ? 'shapeEdge' : 'default',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: shapeLabel ? { shape: shapeLabel } : undefined,
    };
  });
}
