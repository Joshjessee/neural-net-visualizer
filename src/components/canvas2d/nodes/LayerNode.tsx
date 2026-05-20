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

  const borderColor = isFlowActive
    ? '#f97316'
    : isFlowPassed
      ? '#fdba7480'
      : isSelected
        ? '#58a6ff'
        : colors.border;

  const boxShadow = isFlowActive
    ? `0 0 0 2px rgba(249,115,22,0.3), 0 8px 24px rgba(0,0,0,0.5)`
    : isSelected
      ? `0 0 0 3px rgba(88,166,255,0.2), 0 8px 24px rgba(0,0,0,0.5)`
      : `0 2px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`;

  const transform = isFlowActive ? 'scale(1.05)' : isSelected ? 'scale(1.04)' : 'scale(1)';

  return (
    <div
      className={`flex rounded-xl cursor-pointer overflow-hidden min-w-[210px] relative ${isFlowActive ? 'animate-pulse' : ''}`}
      style={{
        backgroundColor: colors.bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        transform,
        transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
      }}
      onClick={() => { selectLayer(id); setActivePanel('config'); }}
    >
      {/* Left color accent bar */}
      <div
        className="w-1 shrink-0"
        style={{
          background: `linear-gradient(180deg, ${colors.border} 0%, ${colors.border}88 100%)`,
        }}
      />

      {/* Content */}
      <div className="flex-1 px-3 py-2.5">
        {/* Top row: icon + name + index */}
        <div className="flex items-center gap-2">
          <span className="text-sm shrink-0 leading-none">{LAYER_ICONS[layer.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate leading-tight" style={{ color: colors.text }}>
              {layer.name}
            </div>
            <div className="text-[10px] leading-tight mt-0.5" style={{ color: '#6e7681' }}>
              {LAYER_DISPLAY_NAMES[layer.type]}
            </div>
          </div>
          <span
            className="text-[10px] font-mono rounded px-1.5 py-0.5 shrink-0"
            style={{
              color: '#484f58',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            #{index + 1}
          </span>
        </div>

        {/* Detail row */}
        {detailText && (
          <div
            className="mt-1.5 text-[10px] pt-1.5 leading-snug"
            style={{
              color: '#8b949e',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {detailText}
          </div>
        )}

        {/* Output shape */}
        {outputShape && (
          <div className="mt-0.5 text-[9px] font-mono" style={{ color: '#30363d' }}>
            → {outputShape}
          </div>
        )}
      </div>

      {/* Handles */}
      {layer.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            backgroundColor: colors.border,
            border: '2px solid #0d1117',
            width: '10px',
            height: '10px',
          }}
        />
      )}
      {layer.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            backgroundColor: colors.border,
            border: '2px solid #0d1117',
            width: '10px',
            height: '10px',
          }}
        />
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

  if (layer.units) parts.push(`${layer.units} units`);
  if (layer.filters) parts.push(`${layer.filters} filters`);
  if (layer.kernelSize) parts.push(`${layer.kernelSize.join('×')} kernel`);
  if (layer.poolSize) parts.push(`${layer.poolSize.join('×')} pool`);
  if (layer.rate !== undefined && layer.type === 'dropout') parts.push(`rate ${layer.rate}`);
  if (layer.inputShape) parts.push(`[${layer.inputShape.join('×')}]`);
  if (layer.numHeads) parts.push(`${layer.numHeads} heads`);
  if (layer.vocabSize) parts.push(`vocab ${layer.vocabSize.toLocaleString()}`);
  if (layer.embeddingDim) parts.push(`dim ${layer.embeddingDim}`);
  if (layer.activation && layer.activation !== 'linear') {
    parts.push(ACTIVATIONS[layer.activation]?.name || layer.activation);
  }

  return parts.join(' · ');
}
