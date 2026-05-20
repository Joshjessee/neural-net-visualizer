import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { LAYER_COLORS, LAYER_ICONS } from '../../../constants/colors';
import { LAYER_DISPLAY_NAMES } from '../../../constants/layerDefaults';
import { ACTIVATIONS } from '../../../constants/activations';
import { useStore } from '../../../store';
import type { LayerNodeData } from '../../../utils/networkToReactFlow';

type LayerNodeType = Node<LayerNodeData>;

export function LayerNode({ data, id }: NodeProps<LayerNodeType>) {
  const { layer, isSelected, isFlowActive, isFlowPassed, index, outputShape } = data;
  const colors = LAYER_COLORS[layer.type];
  const selectLayer = useStore(s => s.selectLayer);
  const setActivePanel = useStore(s => s.setActivePanel);
  const experienceMode = useStore(s => s.experienceMode);

  const detailText = experienceMode === 'beginner' ? getBeginnerDetailText(layer) : getDetailText(layer);

  const ringClass = isFlowActive
    ? 'ring-2 ring-orange-400 ring-offset-2 scale-105 animate-pulse'
    : isSelected
      ? 'ring-2 ring-blue-400 ring-offset-2 scale-105'
      : 'hover:shadow-md';

  return (
    <div
      className={`rounded-lg border-2 shadow-sm cursor-pointer transition-all min-w-[200px] ${ringClass}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: isFlowActive ? '#f97316' : isFlowPassed ? '#fdba74' : colors.border,
      }}
      onClick={() => { selectLayer(id); setActivePanel('config'); }}
    >
      {layer.type !== 'input' && (
        <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      )}

      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{LAYER_ICONS[layer.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: colors.text }}>
              {layer.name}
            </div>
            <div className="text-[10px] text-gray-500">
              {LAYER_DISPLAY_NAMES[layer.type]}
            </div>
          </div>
          <span className="text-[10px] text-gray-400 bg-white/60 rounded px-1 py-0.5">
            #{index + 1}
          </span>
        </div>

        {detailText && (
          <div className="mt-1 text-[10px] text-gray-600 border-t border-black/5 pt-1">
            {detailText}
          </div>
        )}

        {outputShape && (
          <div className="mt-0.5 text-[9px] font-mono text-gray-400">
            out: {outputShape}
          </div>
        )}
      </div>

      {layer.type !== 'output' && (
        <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
      )}
    </div>
  );
}

function getBeginnerDetailText(layer: LayerNodeData['layer']): string {
  const parts: string[] = [];

  if (layer.units) parts.push(`${layer.units} neurons`);
  if (layer.filters) parts.push(`${layer.filters} filters`);
  if (layer.rate !== undefined && layer.type === 'dropout') parts.push(`${Math.round(layer.rate * 100)}% drop`);
  if (layer.inputShape) parts.push(`[${layer.inputShape.join(', ')}]`);
  if (layer.numHeads) parts.push(`${layer.numHeads} heads`);
  if (layer.embeddingDim) parts.push(`dim ${layer.embeddingDim}`);
  if (layer.activation && layer.activation !== 'linear') {
    parts.push(ACTIVATIONS[layer.activation]?.name || layer.activation);
  }

  return parts.join(' · ');
}

function getDetailText(layer: LayerNodeData['layer']): string {
  const parts: string[] = [];

  if (layer.units) parts.push(`units: ${layer.units}`);
  if (layer.filters) parts.push(`filters: ${layer.filters}`);
  if (layer.kernelSize) parts.push(`kernel: ${layer.kernelSize.join('×')}`);
  if (layer.poolSize) parts.push(`pool: ${layer.poolSize.join('×')}`);
  if (layer.rate !== undefined && layer.type === 'dropout') parts.push(`rate: ${layer.rate}`);
  if (layer.inputShape) parts.push(`shape: [${layer.inputShape.join(', ')}]`);
  if (layer.numHeads) parts.push(`heads: ${layer.numHeads}`);
  if (layer.vocabSize) parts.push(`vocab: ${layer.vocabSize.toLocaleString()}`);
  if (layer.embeddingDim) parts.push(`dim: ${layer.embeddingDim}`);
  if (layer.activation && layer.activation !== 'linear') {
    parts.push(`act: ${ACTIVATIONS[layer.activation]?.name || layer.activation}`);
  }

  return parts.join(' · ');
}
