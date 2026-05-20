import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store';
import { networkToReactFlowNodes, networkToReactFlowEdges } from '../../utils/networkToReactFlow';
import { propagateShapes } from '../../utils/shapePropagator';
import { LayerNode } from './nodes/LayerNode';
import { ShapeEdge } from './edges/ShapeEdge';
import { LAYER_COLORS } from '../../constants/colors';

const nodeTypes: NodeTypes = {
  layerNode: LayerNode,
};

const edgeTypes: EdgeTypes = {
  shapeEdge: ShapeEdge,
};

export function Canvas2D() {
  const { layers, connections, selectedLayerId } = useStore();

  const shapes = useMemo(() => propagateShapes(layers), [layers]);

  const initialNodes = useMemo(
    () => networkToReactFlowNodes(layers, selectedLayerId, shapes),
    [layers, selectedLayerId, shapes]
  );

  const initialEdges = useMemo(
    () => networkToReactFlowEdges(connections, layers, shapes),
    [connections, layers, shapes]
  );

  return (
    <div className="w-full h-full" style={{ backgroundColor: '#0d1117' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ backgroundColor: '#0d1117' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#1e2d3d"
          style={{ backgroundColor: '#0d1117' }}
        />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-left"
          nodeColor={node => {
            const data = node.data as { layer: { type: keyof typeof LAYER_COLORS } };
            if (data?.layer?.type && LAYER_COLORS[data.layer.type]) {
              return LAYER_COLORS[data.layer.type].border;
            }
            return '#30363d';
          }}
          maskColor="rgba(13,17,23,0.75)"
          style={{
            width: 140,
            height: 95,
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  );
}
