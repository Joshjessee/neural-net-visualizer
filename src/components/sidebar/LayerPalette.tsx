import { useStore } from '../../store';
import type { LayerType } from '../../types/network';
import { LAYER_DISPLAY_NAMES, MODEL_TYPE_LAYERS } from '../../constants/layerDefaults';
import { LAYER_COLORS, LAYER_ICONS } from '../../constants/colors';

export function LayerPalette() {
  const { addLayer, modelType, layers } = useStore();

  const availableTypes = MODEL_TYPE_LAYERS[modelType];

  return (
    <div className="p-3">
      <h3
        className="text-[10px] font-semibold uppercase tracking-widest mb-2.5"
        style={{ color: '#6e7681' }}
      >
        Add Layer
      </h3>

      <div className="grid grid-cols-2 gap-1.5">
        {availableTypes.map(type => {
          const colors = LAYER_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => addLayer(type)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: colors.bg,
                border: `1.5px solid ${colors.border}`,
                color: colors.text,
                boxShadow: `0 0 0 0 ${colors.border}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 10px ${colors.border}55`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <span className="text-sm leading-none">{LAYER_ICONS[type as LayerType]}</span>
              <span className="truncate">{LAYER_DISPLAY_NAMES[type]}</span>
            </button>
          );
        })}
      </div>

      {layers.length === 0 && (
        <p className="text-[10px] mt-3 text-center" style={{ color: '#484f58' }}>
          Click a layer type to add it
        </p>
      )}
    </div>
  );
}
