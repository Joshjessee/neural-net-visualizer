import { useStore } from '../../store';
import { LAYER_COLORS } from '../../constants/colors';
import { LAYER_DISPLAY_NAMES } from '../../constants/layerDefaults';
import { calculateLayerParams, formatParamCount } from '../../utils/paramCalculator';

export function NetworkSummary() {
  const { layers, selectedLayerId, selectLayer, setActivePanel } = useStore();

  if (layers.length === 0) {
    return (
      <div className="p-4 text-xs text-center" style={{ color: '#484f58' }}>
        No layers yet
      </div>
    );
  }

  let totalParams = 0;
  const layerParams = layers.map((layer, index) => {
    const prevLayer = index > 0 ? layers[index - 1] : null;
    const params = calculateLayerParams(layer, prevLayer);
    totalParams += params;
    return params;
  });

  return (
    <div className="p-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: '#6e7681' }}
        >
          Network
        </h3>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{
            color: '#8b949e',
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
          }}
        >
          {formatParamCount(totalParams)} params
        </span>
      </div>

      <div className="space-y-1">
        {layers.map((layer, index) => {
          const colors = LAYER_COLORS[layer.type];
          const isSelected = layer.id === selectedLayerId;
          return (
            <button
              key={layer.id}
              onClick={() => { selectLayer(layer.id); setActivePanel('config'); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: isSelected ? colors.bg : '#21262d',
                border: `1px solid ${isSelected ? colors.border : '#30363d'}`,
                boxShadow: isSelected ? `0 0 8px ${colors.border}44` : 'none',
              }}
            >
              {/* Color pip */}
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: colors.border }}
              />
              {/* Index */}
              <span className="text-[10px] font-mono w-4 text-right shrink-0" style={{ color: '#484f58' }}>
                {index + 1}
              </span>
              {/* Name */}
              <span
                className="font-medium truncate flex-1 text-left"
                style={{ color: isSelected ? colors.text : '#c9d1d9' }}
              >
                {layer.name}
              </span>
              {/* Type */}
              <span className="text-[10px] shrink-0" style={{ color: '#6e7681' }}>
                {LAYER_DISPLAY_NAMES[layer.type]}
              </span>
              {/* Params */}
              <span
                className="text-[10px] font-mono w-14 text-right shrink-0"
                style={{ color: '#484f58' }}
              >
                {layerParams[index] > 0 ? formatParamCount(layerParams[index]) : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
