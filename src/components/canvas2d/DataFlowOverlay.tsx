import { Panel } from '@xyflow/react';
import { useStore } from '../../store';
import { TensorMiniViz } from '../shared/TensorMiniViz';

export function DataFlowOverlay() {
  const {
    isFlowAnimating,
    flowActiveLayerIndex,
    flowActivations,
    flowInputSample,
    flowInputShape,
    layers,
  } = useStore();

  if (!isFlowAnimating && flowActiveLayerIndex < 0) return null;
  if (!flowActivations) return null;

  const activeLayer = layers[flowActiveLayerIndex];
  if (!activeLayer) return null;

  let vizValues: number[] | null = null;
  let vizShape: number[] | null = null;

  if (flowActiveLayerIndex === 0 && flowInputSample && flowInputShape) {
    vizValues = flowInputSample.slice(0, 2048);
    vizShape = flowInputShape;
  } else {
    const activation = flowActivations[activeLayer.id];
    if (activation) {
      vizValues = activation.values.slice(0, 2048);
      vizShape = activation.shape;
    }
  }

  if (!vizValues || !vizShape) return null;

  return (
    <Panel position="top-right">
      <div className="bg-white/95 rounded-lg shadow-lg border border-orange-200 p-3 min-w-[120px]">
        <div className="text-[10px] font-semibold text-orange-600 mb-1.5 uppercase tracking-wider">
          Data Flow
        </div>
        <div className="text-[11px] text-gray-700 font-medium mb-1.5 truncate max-w-[140px]">
          {activeLayer.name}
        </div>
        <TensorMiniViz values={vizValues} shape={vizShape} size={80} />
        <div className="text-[9px] text-gray-500 text-center mt-1 font-mono">
          [{vizShape.join(', ')}]
        </div>
        <div className="text-[9px] text-gray-400 text-center mt-0.5">
          Layer {flowActiveLayerIndex + 1} / {layers.length}
        </div>
      </div>
    </Panel>
  );
}
