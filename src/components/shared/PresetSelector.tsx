import { useStore } from '../../store';
import { PRESETS } from '../../constants/presets';
import type { PresetId } from '../../constants/presets';

export function PresetSelector() {
  const { loadNetwork, presetId } = useStore();

  const handleSelect = (id: string) => {
    if (id === '') return;
    const preset = PRESETS[id as PresetId];
    if (preset) {
      const config = preset.create();
      loadNetwork(config.layers, config.connections, config.modelType, config.name, id);
    }
  };

  return (
    <label className="flex items-center gap-2 text-xs text-gray-600">
      Preset:
      <select
        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
        value={presetId || ''}
        onChange={e => handleSelect(e.target.value)}
      >
        <option value="">Custom</option>
        {Object.entries(PRESETS).map(([id, preset]) => (
          <option key={id} value={id}>{preset.name}</option>
        ))}
      </select>
    </label>
  );
}
