import { useStore } from '../../store';
import { LAYER_COLORS } from '../../constants/colors';
import { LAYER_DISPLAY_NAMES } from '../../constants/layerDefaults';
import { calculateLayerParams, formatParamCount } from '../../utils/paramCalculator';

export function NetworkSummary() {
  const { layers, selectedLayerId, selectLayer, setActivePanel } = useStore();

  if (layers.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-400 text-center">
        No layers yet. Add some from the palette above.
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Network Summary
        </h3>
        <span className="text-[10px] text-gray-500">
          {formatParamCount(totalParams)} params
        </span>
      </div>

      <div className="space-y-0.5">
        {layers.map((layer, index) => {
          const colors = LAYER_COLORS[layer.type];
          const isSelected = layer.id === selectedLayerId;
          return (
            <button
              key={layer.id}
              onClick={() => { selectLayer(layer.id); setActivePanel('config'); }}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-all ${
                isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : 'hover:ring-1 hover:ring-gray-300'
              }`}
              style={{ backgroundColor: colors.bg, borderLeft: `3px solid ${colors.border}` }}
            >
              <span className="text-gray-400 text-[10px] w-4">{index + 1}</span>
              <span className="font-medium truncate flex-1 text-left" style={{ color: colors.text }}>
                {layer.name}
              </span>
              <span className="text-[10px] text-gray-400">
                {LAYER_DISPLAY_NAMES[layer.type]}
              </span>
              <span className="text-[10px] text-gray-400 w-14 text-right">
                {layerParams[index] > 0 ? formatParamCount(layerParams[index]) : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
