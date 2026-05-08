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
    <div className="w-full h-full">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={node => {
            const data = node.data as { layer: { type: string } };
            return data?.layer?.type ? '#94a3b8' : '#ddd';
          }}
          style={{ width: 120, height: 80 }}
        />
      </ReactFlow>
    </div>
  );
}
