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
    <label className="flex items-center gap-2 text-xs shrink-0" style={{ color: '#8b949e' }}>
      <span>Preset</span>
      <select
        className="text-xs rounded-md px-2 py-1 outline-none transition-colors cursor-pointer"
        style={{
          backgroundColor: '#21262d',
          border: '1px solid #30363d',
          color: '#f0f6fc',
        }}
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
