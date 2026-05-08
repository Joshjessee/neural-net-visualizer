import { useStore } from '../../store';
import type { LayerType } from '../../types/network';
import { LAYER_DISPLAY_NAMES, MODEL_TYPE_LAYERS } from '../../constants/layerDefaults';
import { LAYER_COLORS, LAYER_ICONS } from '../../constants/colors';

export function LayerPalette() {
  const { addLayer, modelType, layers } = useStore();

  const availableTypes = MODEL_TYPE_LAYERS[modelType];

  const handleAdd = (type: LayerType) => {
    addLayer(type);
  };

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Add Layer
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        {availableTypes.map(type => {
          const colors = LAYER_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => handleAdd(type)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium border transition-all hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <span>{LAYER_ICONS[type]}</span>
              <span>{LAYER_DISPLAY_NAMES[type]}</span>
            </button>
          );
        })}
      </div>
      {layers.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Click a layer to add it to the network
        </p>
      )}
    </div>
  );
}
